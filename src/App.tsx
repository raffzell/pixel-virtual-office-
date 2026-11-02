import { useState, useEffect, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { LeftNav, ActiveTab } from './components/LeftNav';
import { RightToDoList } from './components/RightToDoList';
import { DialogueBox } from './components/DialogueBox';
import { MinimapRadar } from './components/MinimapRadar';
import { OfficeWorld } from './components/OfficeWorld';
import { ScreenPeekModal } from './components/ScreenPeekModal';
import { MeetingRoomModal } from './components/MeetingRoomModal';
import { AgentRosterModal } from './components/AgentRosterModal';
import { KanbanModal } from './components/KanbanModal';
import { SettingsModal } from './components/SettingsModal';
import { ChatMessengerModal } from './components/ChatMessengerModal';

import {
  Agent,
  Direction,
  MapRenderMode,
  OfficeHotspot,
  PlayerStats,
  Point,
  SpriteRenderMode,
  Task,
  WeatherType,
} from './types/office';
import {
  AGENT_BANTER_LINES,
  INITIAL_AGENTS,
  INITIAL_TASKS,
  MEETING_SEATS,
  OFFICE_HOTSPOTS,
} from './data/officeData';
import { findPath, isPointWalkable, isSegmentWalkable } from './utils/pathfinding';
import { sound } from './utils/audio';

export default function App() {
  // Player State
  const [player, setPlayer] = useState<PlayerStats>({
    name: 'RaffZell',
    characterId: '01',
    level: 1,
    currentExp: 0,
    maxExp: 100,
    title: 'Staff',
    coins: 1000,
  });

  // World & Navigation State
  const [playerPos, setPlayerPos] = useState<Point>({ x: 49.5, y: 58.0 });
  const [playerFacing, setPlayerFacing] = useState<Direction>('up');
  const [playerIsMoving, setPlayerIsMoving] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('office');

  // Visual Mode State (15-Character Spritesheet HD as default + Clean Office Background + 1:1 32-Bit HD Overlay)
  const [spriteMode, setSpriteMode] = useState<SpriteRenderMode>('spritesheet_hd');
  const [mapMode, setMapMode] = useState<MapRenderMode>('reference_image');

  // Simulation State
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [weather, setWeather] = useState<WeatherType>('sunny');
  const [gameTime, setGameTime] = useState<{ hours: number; minutes: number }>({ hours: 9, minutes: 0 });
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modals & Dialogue State
  const [activeDialogueAgentId, setActiveDialogueAgentId] = useState<string | null>(null);
  const [dialogueInitialMessage, setDialogueInitialMessage] = useState<string | undefined>(undefined);
  const [peekAgentId, setPeekAgentId] = useState<string | null>(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [showKanbanModal, setShowKanbanModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  // Sound toggle sync
  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  // Game Clock ticker (every 4 seconds = 10 game minutes)
  useEffect(() => {
    const timer = setInterval(() => {
      setGameTime((prev) => {
        let nextM = prev.minutes + 10;
        let nextH = prev.hours;
        if (nextM >= 60) {
          nextM = 0;
          nextH = (nextH + 1) % 24;
        }
        return { hours: nextH, minutes: nextM };
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const timeString = `Mon ${String(gameTime.hours).padStart(2, '0')}:${String(gameTime.minutes).padStart(2, '0')}`;

  // Autonomous Agent A* Waypoint Movement Loop (45ms smooth tick with strict wall collision)
  useEffect(() => {
    const moveTimer = setInterval(() => {
      setAgents((prevAgents) => {
        let anyMoved = false;
        const updated = prevAgents.map((agent) => {
          if (!agent.path || agent.path.length === 0) return agent;

          anyMoved = true;
          const nextWaypoint = agent.path[0];
          const dx = nextWaypoint.x - agent.currentPos.x;
          const dy = nextWaypoint.y - agent.currentPos.y;
          const dist = Math.hypot(dx, dy);

          let facing: Direction = agent.facing;
          if (Math.abs(dx) > Math.abs(dy)) {
            facing = dx > 0 ? 'right' : 'left';
          } else {
            facing = dy > 0 ? 'down' : 'up';
          }

          const speed = 0.65;
          if (dist <= speed) {
            const remainingPath = agent.path.slice(1);
            const arrived = remainingPath.length === 0;
            let arrivalPose = agent.pose || 'standing';
            let arrivalFacing = facing;

            if (arrived) {
              if (agent.status === 'working') {
                arrivalPose = 'sitting_typing';
                arrivalFacing = agent.deskFacing || 'up';
              } else if (agent.status === 'break') {
                arrivalPose = 'drinking_coffee';
                arrivalFacing = 'down';
              } else if (agent.status === 'meeting') {
                arrivalPose = 'sitting_typing';
                arrivalFacing = agent.targetPos.y < 26 ? 'down' : 'up';
              } else {
                arrivalPose = 'standing';
              }
            }

            const safePos = isPointWalkable(nextWaypoint.x, nextWaypoint.y)
              ? { x: nextWaypoint.x, y: nextWaypoint.y }
              : agent.currentPos;

            return {
              ...agent,
              currentPos: safePos,
              path: remainingPath,
              facing: arrivalFacing,
              pose: arrived ? arrivalPose : 'walking',
            };
          } else {
            const nextStep = {
              x: Number((agent.currentPos.x + (dx / dist) * speed).toFixed(2)),
              y: Number((agent.currentPos.y + (dy / dist) * speed).toFixed(2)),
            };

            if (
              isPointWalkable(nextStep.x, nextStep.y) &&
              isSegmentWalkable(agent.currentPos, nextStep)
            ) {
              return {
                ...agent,
                currentPos: nextStep,
                facing,
                pose: 'walking' as const,
              };
            } else {
              // Recalculate path around the wall if segment is blocked
              const finalTarget = agent.path[agent.path.length - 1] || agent.targetPos;
              const rerouted = findPath(agent.currentPos, finalTarget);
              return {
                ...agent,
                path: rerouted.length > 0 && isSegmentWalkable(agent.currentPos, rerouted[0]) ? rerouted : [],
                pose: 'standing' as const,
              };
            }
          }
        });

        return anyMoved ? updated : prevAgents;
      });
    }, 45);

    return () => clearInterval(moveTimer);
  }, []);

  // Autonomous Routine & Proximity Chatter Engine (Agents take coffee breaks, return to desks, and chat when passing by)
  useEffect(() => {
    const routineTimer = setInterval(() => {
      setAgents((prevAgents) => {
        const next = prevAgents.map((a) => ({ ...a }));

        // 1. Clear expired speech bubbles
        const now = Date.now();
        for (const a of next) {
          if (a.bubbleTimer && now > a.bubbleTimer) {
            a.speechBubble = undefined;
            a.bubbleTimer = undefined;
          }
        }

        // 2. Pick one non-meeting idle/working agent to occasionally walk to coffee/lounge or back to desk
        const candidates = next.filter(
          (a) => a.status !== 'meeting' && (!a.path || a.path.length === 0)
        );
        if (candidates.length > 0 && Math.random() < 0.45) {
          const picked = candidates[Math.floor(Math.random() * candidates.length)];
          const distFromDesk = Math.hypot(
            picked.currentPos.x - picked.deskPos.x,
            picked.currentPos.y - picked.deskPos.y
          );

          if (distFromDesk > 3) {
            // Walk back to their desk to work
            const path = findPath(picked.currentPos, picked.deskPos);
            picked.status = 'working';
            picked.targetPos = { ...picked.deskPos };
            picked.path = path;
            picked.activityEmoji = '💻';
          } else if (Math.random() < 0.5) {
            // Walk to pantry or lounge for a coffee break via doorway-aware A* pathfinding
            const loungeOrCoffeeSpots: Point[] = [
              { x: 28.5, y: 70.8 },
              { x: 23.0, y: 73.5 },
              { x: 63.8, y: 48.0 },
              { x: 48.5, y: 43.0 },
            ];
            const spot = loungeOrCoffeeSpots[Math.floor(Math.random() * loungeOrCoffeeSpots.length)];
            const path = findPath(picked.currentPos, spot);
            picked.status = 'break';
            picked.targetPos = spot;
            picked.path = path;
            picked.activityEmoji = '☕';
          }
        }

        // 3. Trigger Proximity Banter between two close agents
        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const a1 = next[i];
            const a2 = next[j];
            if (a1.speechBubble || a2.speechBubble) continue;

            const dist = Math.hypot(
              a1.currentPos.x - a2.currentPos.x,
              a1.currentPos.y - a2.currentPos.y
            );
            if (dist > 2 && dist < 11 && Math.random() < 0.35) {
              const banter =
                AGENT_BANTER_LINES[Math.floor(Math.random() * AGENT_BANTER_LINES.length)];
              a1.speechBubble = banter.a;
              a1.bubbleTimer = now + 4200;
              a2.speechBubble = banter.b;
              a2.bubbleTimer = now + 4200;
              break;
            }
          }
        }

        return next;
      });
    }, 4500);

    return () => clearInterval(routineTimer);
  }, []);

  // EXP & Level Up Handler
  const addPlayerExp = useCallback((amount: number, coins: number = 0) => {
    setPlayer((prev) => {
      let newExp = prev.currentExp + amount;
      let newLevel = prev.level;
      let newMax = prev.maxExp;
      let newTitle = prev.title;

      while (newExp >= newMax) {
        newExp -= newMax;
        newLevel += 1;
        newMax = Math.round(newMax * 1.5);
        sound.playFanfare();

        if (newLevel >= 5) newTitle = 'CEO';
        else if (newLevel >= 4) newTitle = 'Lead Architect';
        else if (newLevel >= 3) newTitle = 'Senior Specialist';
        else if (newLevel >= 2) newTitle = 'Officer';
      }

      return {
        ...prev,
        level: newLevel,
        currentExp: newExp,
        maxExp: newMax,
        title: newTitle,
        coins: prev.coins + coins,
      };
    });
  }, []);

  // Task Toggle Handler
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            addPlayerExp(t.expReward, t.coinsReward);
          }
          return {
            ...t,
            completed: nextCompleted,
            column: nextCompleted ? 'done' : 'in_progress',
          };
        }
        return t;
      })
    );
  };

  // Add new task
  const handleAddTask = (
    title: string,
    assigneeId: string,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      completed: false,
      expReward: 30,
      coinsReward: 120,
      assigneeId,
      priority,
      column: 'todo',
    };
    setTasks((prev) => [newTask, ...prev]);

    // Walk assigned agent back to their desk to work on it
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id === assigneeId) {
          const path = findPath(a.currentPos, a.deskPos);
          return {
            ...a,
            currentTask: title,
            status: 'working',
            targetPos: { ...a.deskPos },
            path,
            activityEmoji: '⚡',
            speechBubble: `Siap kerjakan: "${title.slice(0, 22)}..."`,
            bubbleTimer: Date.now() + 3800,
          };
        }
        return a;
      })
    );
  };

  // Move task across Kanban columns
  const handleMoveTask = (
    taskId: string,
    targetCol: 'todo' | 'in_progress' | 'review' | 'done'
  ) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isDone = targetCol === 'done';
          if (isDone && !t.completed) {
            addPlayerExp(t.expReward, t.coinsReward);
          }
          return { ...t, column: targetCol, completed: isDone };
        }
        return t;
      })
    );
  };

  // Move player handler
  const handleMovePlayer = useCallback(
    (pos: Point, facing: Direction, isMoving: boolean) => {
      setPlayerPos(pos);
      setPlayerFacing(facing);
      setPlayerIsMoving(isMoving);
    },
    []
  );

  // Agent Selection / Open JRPG Dialogue
  const handleSelectAgent = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;
    setActiveDialogueAgentId(agentId);
    setDialogueInitialMessage(undefined);
  };

  // Trigger A2A Meeting: agents pathfind via A* to the conference room seats!
  const handleCallMeeting = (initiatorAgentId?: string) => {
    sound.playMeetingBell();
    setActiveDialogueAgentId(null);
    setShowMeetingModal(true);

    const meetingParticipantIds = ['01', '06', '02', '05'];
    if (initiatorAgentId && !meetingParticipantIds.includes(initiatorAgentId)) {
      meetingParticipantIds[3] = initiatorAgentId;
    }

    setAgents((prev) =>
      prev.map((agent) => {
        const pIdx = meetingParticipantIds.indexOf(agent.id);
        if (pIdx !== -1) {
          const seat = MEETING_SEATS[pIdx];
          const path = findPath(agent.currentPos, { x: seat.x, y: seat.y });
          return {
            ...agent,
            status: 'meeting',
            targetPos: { x: seat.x, y: seat.y },
            path,
            facing: seat.facing,
            activityEmoji: '🤝',
            speechBubble: 'Menuju ruang rapat!',
            bubbleTimer: Date.now() + 3000,
          };
        }
        return agent;
      })
    );
  };

  // Return agents from meeting back to their desks via A* pathfinding
  const handleCompleteMeeting = () => {
    addPlayerExp(75, 300);
    setTimeout(() => {
      setAgents((prev) =>
        prev.map((agent) => {
          if (agent.status === 'meeting') {
            const path = findPath(agent.currentPos, agent.deskPos);
            return {
              ...agent,
              status: 'working',
              targetPos: { ...agent.deskPos },
              path,
              activityEmoji: '⚡',
              speechBubble: 'Kembali ke meja kerja!',
              bubbleTimer: Date.now() + 3000,
            };
          }
          return agent;
        })
      );
    }, 1000);
  };

  // Screen Peek
  const handlePeekScreen = (agentId: string) => {
    setPeekAgentId(agentId);
  };

  // Coffee break command with A* pathfinding to Pantry
  const handleSendCoffeeBreak = (agentId: string) => {
    const coffeeSpot = { x: 28.5, y: 70.8 };
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id === agentId) {
          const path = findPath(a.currentPos, coffeeSpot);
          return {
            ...a,
            status: 'break',
            targetPos: coffeeSpot,
            path,
            activityEmoji: '☕',
            speechBubble: 'Waktunya ngopi sebentar~ ☕',
            bubbleTimer: Date.now() + 3800,
          };
        }
        return a;
      })
    );
  };

  // Hotspot interaction
  const handleInteractHotspot = (hotspot: OfficeHotspot) => {
    if (hotspot.category === 'cat') {
      sound.playPurr();
      addPlayerExp(50, 50);
      setActiveDialogueAgentId('01');
      setDialogueInitialMessage(
        'Kucing kantor mendengkur senang saat dielus. Anda mendapatkan +50 EXP & Aura Ketenangan!'
      );
    } else if (hotspot.category === 'coffee') {
      sound.playFanfare();
      addPlayerExp(25, 20);
      setActiveDialogueAgentId('02');
      setDialogueInitialMessage(
        'Menikmati secangkir espresso hangat dari pantry! Stamina dan kecepatan mengetik meningkat drastis.'
      );
    } else if (hotspot.category === 'vending') {
      sound.playClick();
      setActiveDialogueAgentId('05');
      setDialogueInitialMessage(
        'Mesin minuman otomatis menyediakan soda dingin dan kopi kaleng retro. Kaito sering mampir ke sini saat compile build.'
      );
    } else if (hotspot.category === 'meeting') {
      handleCallMeeting();
    } else if (hotspot.category === 'executive') {
      setShowKanbanModal(true);
    } else if (hotspot.category === 'bulletin') {
      setShowRosterModal(true);
    }
  };

  // Switch Player Avatar
  const handleSelectPlayerAvatar = (agentId: string) => {
    const selected = agents.find((a) => a.id === agentId);
    if (!selected) return;
    setPlayer((prev) => ({
      ...prev,
      name: selected.name,
      characterId: selected.id,
    }));
  };

  const toggleSpriteMode = () => {
    setSpriteMode((prev) =>
      prev === 'spritesheet_hd'
        ? 'roster_transparent'
        : prev === 'roster_transparent'
        ? 'animated'
        : 'spritesheet_hd'
    );
  };

  const activeAgent = agents.find((a) => a.id === activeDialogueAgentId);
  const peekAgent = agents.find((a) => a.id === peekAgentId);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans flex flex-col select-none">
      {/* Top HUD Bar */}
      <TopBar
        player={player}
        timeString={timeString}
        weather={weather}
        spriteMode={spriteMode}
        onWeatherChange={setWeather}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenMail={() => setShowChatModal(true)}
        onOpenRoster={() => setShowRosterModal(true)}
      />

      {/* Main Game Stage */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Left Nav Bar */}
        <LeftNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'tasks') setShowKanbanModal(true);
            if (tab === 'chat') setShowChatModal(true);
            if (tab === 'roster') setShowRosterModal(true);
            if (tab === 'settings') setShowSettingsModal(true);
          }}
          unreadChats={1}
          pendingTasks={tasks.filter((t) => !t.completed).length}
        />

        {/* 2D RPG Office Canvas Simulation */}
        <main className="flex-1 relative overflow-hidden bg-slate-950">
          <OfficeWorld
            playerPos={playerPos}
            playerFacing={playerFacing}
            playerIsMoving={playerIsMoving}
            playerCharacterId={player.characterId}
            agents={agents}
            hotspots={OFFICE_HOTSPOTS}
            weather={weather}
            spriteMode={spriteMode}
            mapMode={mapMode}
            onToggleSpriteMode={toggleSpriteMode}
            onMovePlayer={handleMovePlayer}
            onSelectAgent={handleSelectAgent}
            onInteractHotspot={handleInteractHotspot}
            activeDialogueAgentId={activeDialogueAgentId}
          />

          {/* Right Floating To-Do List Sidebar */}
          <div className="absolute top-3 right-3 z-30 hidden md:block">
            <RightToDoList
              tasks={tasks}
              agents={agents}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onAgentSelect={handleSelectAgent}
            />
          </div>

          {/* Bottom Right Minimap Radar */}
          <div className="absolute bottom-3 right-3 z-30 hidden lg:block">
            <MinimapRadar
              playerPos={playerPos}
              agents={agents}
              onRoomClick={(pos) => handleMovePlayer(pos, 'down', true)}
            />
          </div>

          {/* JRPG Dialogue Box */}
          {activeAgent && (
            <DialogueBox
              agent={activeAgent}
              initialMessage={dialogueInitialMessage}
              onClose={() => setActiveDialogueAgentId(null)}
              onCallMeeting={handleCallMeeting}
              onPeekScreen={handlePeekScreen}
              onAssignTask={handleAddTask}
              onSendCoffeeBreak={handleSendCoffeeBreak}
              officeContext={{ time: timeString, weather }}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {peekAgent && (
        <ScreenPeekModal agent={peekAgent} onClose={() => setPeekAgentId(null)} />
      )}

      {showMeetingModal && (
        <MeetingRoomModal
          agents={agents}
          onClose={() => setShowMeetingModal(false)}
          onCompleteMeeting={handleCompleteMeeting}
        />
      )}

      {showRosterModal && (
        <AgentRosterModal
          agents={agents}
          activePlayerId={player.characterId}
          spriteMode={spriteMode}
          onToggleSpriteMode={toggleSpriteMode}
          onSelectPlayer={handleSelectPlayerAvatar}
          onOpenAgentChat={(agentId) => {
            setShowRosterModal(false);
            handleSelectAgent(agentId);
          }}
          onClose={() => setShowRosterModal(false)}
        />
      )}

      {showKanbanModal && (
        <KanbanModal
          tasks={tasks}
          agents={agents}
          onClose={() => setShowKanbanModal(false)}
          onAddTask={handleAddTask}
          onMoveTask={handleMoveTask}
        />
      )}

      {showChatModal && (
        <ChatMessengerModal
          agents={agents}
          onClose={() => setShowChatModal(false)}
          officeContext={{ time: timeString, weather }}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          spriteMode={spriteMode}
          onChangeSpriteMode={setSpriteMode}
          mapMode={mapMode}
          onChangeMapMode={setMapMode}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}
