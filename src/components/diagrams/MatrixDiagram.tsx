import { Box3, Cylinder, DiagramFrame, Face, Flow, FlowLabel, Label, Node, leftFace, rightFace } from "./parts";

const ID = "dg-matrix";

function Process() {
  const tiles: [number, number, string][] = [
    [8, 8, "var(--screen-blue)"],
    [22, 8, "var(--status)"],
    [36, 8, "var(--screen-pink)"],
    [8, 24, "var(--status)"],
    [22, 24, "var(--screen-pink)"],
    [36, 24, "var(--screen-blue)"],
  ];
  return (
    <Node cx={100} baseY={282} w={54} d={44}>
      <Box3 w={54} d={44} h={34} />
      {tiles.map(([x, y, c]) => (
        <Face
          key={`${x}-${y}`}
          pts={[
            [x, y, 34.2],
            [x + 10, y, 34.2],
            [x + 10, y + 10, 34.2],
            [x, y + 10, 34.2],
          ]}
          fill={c}
        />
      ))}
      <Face pts={rightFace(54, 6, 38, 12, 16)} fill="var(--dg-screen)" />
    </Node>
  );
}

function Broker() {
  return (
    <Node cx={100} baseY={98} w={42} d={32}>
      <Box3 w={42} d={32} h={30} />
      <Face pts={rightFace(42, 4, 28, 20, 24)} fill="var(--status)" />
    </Node>
  );
}

function Dashboard() {
  return (
    <Node cx={270} baseY={106} w={54} d={8}>
      <Box3 x={22} y={1} w={10} d={6} h={12} />
      <Box3 z={12} w={54} d={8} h={36} />
      <Face pts={leftFace(8, 3, 51, 15, 45)} fill="var(--dg-screen)" />
      {[0, 1, 2, 3].map((i) => (
        <Face key={i} pts={leftFace(8.1, 7, 7 + 16 + ((i * 11) % 24), 38 - i * 6, 41 - i * 6)} fill={i % 2 ? "var(--status)" : "var(--screen-blue)"} />
      ))}
    </Node>
  );
}

function Backups() {
  return (
    <Node cx={270} baseY={448} w={44} d={34}>
      {[0, 11, 22].map((z) => (
        <g key={z}>
          <Box3 z={z} w={44} d={34} h={8} />
          <Face pts={leftFace(34, 4, 12, z + 2.5, z + 5.5)} fill="var(--status)" />
        </g>
      ))}
    </Node>
  );
}

function Drill() {
  return (
    <g>
      <Cylinder cx={100} baseY={448} r={22} h={34} bands={[12]} />
      <path
        d="M92,428 l6,7 l12,-14"
        style={{ fill: "none", stroke: "var(--status)", strokeWidth: 3.5, strokeLinecap: "round", strokeLinejoin: "round" }}
      />
    </g>
  );
}

/** Matrix: one process, one database, broker-held stops, and backups with a restore drill. */
export default function MatrixDiagram() {
  return (
    <DiagramFrame
      id={ID}
      width={360}
      height={512}
      maxWidth={480}
      title="How Matrix fits together"
      desc="One TypeScript process holds the market-data poller, every strategy engine and the trade manager. It writes directly to one Postgres database with TimescaleDB, and Postgres notifications drive a live dashboard over WebSocket. Orders go to a practice broker account that holds every stop and target. The database is backed up by continuous WAL archiving and a nightly dump, and a restore drill rebuilds a scratch copy and checks it."
      caption="Components only. No prices, balances or accounts."
    >
      <Broker />
      <Label x={100} y={126} title="Practice broker" sub={["holds stops + targets"]} />
      <Dashboard />
      <Label x={270} y={126} title="Dashboard" sub={["live over WebSocket"]} />

      <Flow id={ID} from={[100, 196]} to={[100, 160]} both />
      <FlowLabel x={108} y={184} anchor="start" text="orders" />
      <Flow id={ID} from={[150, 204]} to={[238, 162]} />
      <FlowLabel x={206} y={198} anchor="start" text="push" />

      <Process />
      <Label x={100} y={310} title="One TypeScript process" sub={["engines + trade manager"]} />

      <Flow id={ID} from={[150, 248]} to={[226, 248]} both />
      <FlowLabel x={188} y={238} text="writes" />
      <FlowLabel x={188} y={270} text="notify" />

      <Cylinder cx={270} baseY={282} r={30} h={54} bands={[18, 36]} />
      <Label x={270} y={310} title="TimescaleDB" sub={["the only store"]} />

      <Flow id={ID} from={[270, 346]} to={[270, 378]} />
      <FlowLabel x={262} y={368} anchor="end" text="WAL + dump" />

      <Backups />
      <Label x={270} y={476} title="Backups" sub={["WAL archive, nightly dump"]} />
      <Flow id={ID} from={[226, 422]} to={[144, 422]} />
      <FlowLabel x={186} y={412} text="restore" />
      <Drill />
      <Label x={100} y={476} title="Restore drill" sub={["scratch copy, checked"]} />
    </DiagramFrame>
  );
}
