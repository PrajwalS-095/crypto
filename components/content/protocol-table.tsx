import { KeyLabel } from "@/components/ui/key-label";

/** Compact textual summary of the simplified protocol used in this lab. */
export function ProtocolTable() {
  const rows: { n: string; dir: string; msg: React.ReactNode }[] = [
    { n: "1", dir: "Alice → KDC", msg: <>Alice, Bob, N₁</> },
    {
      n: "2",
      dir: "KDC → Alice",
      msg: (
        <>
          E(<KeyLabel id="A" />, [ N₁ ‖ Bob ‖ <KeyLabel id="AB" /> ‖ Ticket ])
        </>
      ),
    },
    {
      n: "",
      dir: "where",
      msg: (
        <>
          Ticket = E(<KeyLabel id="B" />, [ Alice ‖ <KeyLabel id="AB" /> ‖ T ])
        </>
      ),
    },
    { n: "3", dir: "Alice → Bob", msg: <>Ticket</> },
    {
      n: "4",
      dir: "Alice → Bob",
      msg: (
        <>
          E(<KeyLabel id="AB" />, message)
        </>
      ),
    },
  ];

  return (
    <div className="my-5 overflow-x-auto rounded border border-line bg-surface">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Messages exchanged in the simplified KDC protocol</caption>
        <thead className="border-b border-line bg-sunken text-xs text-muted">
          <tr>
            <th scope="col" className="w-14 px-3 py-2 font-medium">
              Step
            </th>
            <th scope="col" className="w-32 px-3 py-2 font-medium">
              Direction
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Content
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-line last:border-0">
              <td className="px-3 py-2 font-mono text-muted">{row.n}</td>
              <td className="whitespace-nowrap px-3 py-2 text-ink-soft">{row.dir}</td>
              <td className="px-3 py-2 font-mono text-[0.85rem] text-ink">{row.msg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
