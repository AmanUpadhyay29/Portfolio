/** Query, the database mascot (from the G2 arcade mockup), as a <g> in room coordinates.
 *  (bx, by) is where the bottom-centre of its body rests; `scale` shrinks the 240x260 art. */
export default function Query({ bx, by, scale }: { bx: number; by: number; scale: number }) {
  return (
    <g transform={`translate(${bx} ${by}) scale(${scale}) translate(-120 -238)`} className="query">
      <defs>
        <linearGradient id="q-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#eaf3fd" />
        </linearGradient>
        <linearGradient id="q-lid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff8a5c" />
          <stop offset="1" stopColor="#ff5e24" />
        </linearGradient>
      </defs>
      <path d="M40 70v130c0 22 36 38 80 38s80-16 80-38V70" fill="url(#q-body)" stroke="#232629" strokeWidth="7" />
      <path d="M40 130c0 22 36 38 80 38s80-16 80-38" fill="none" stroke="#cfe0f5" strokeWidth="6" />
      <path d="M40 70c0-22 36-38 80-38s80 16 80 38-36 38-80 38-80-16-80-38z" fill="url(#q-lid)" stroke="#232629" strokeWidth="7" />
      <ellipse cx="96" cy="58" rx="24" ry="7" fill="rgba(255,255,255,.45)" />
      <g data-eyes>
        <ellipse cx="96" cy="150" rx="9" ry="12" fill="#232629" />
        <ellipse cx="144" cy="150" rx="9" ry="12" fill="#232629" />
        <circle cx="99" cy="145" r="3" fill="#fff" />
        <circle cx="147" cy="145" r="3" fill="#fff" />
      </g>
      <ellipse cx="78" cy="174" rx="11" ry="6" fill="#ffb3c1" />
      <ellipse cx="162" cy="174" rx="11" ry="6" fill="#ffb3c1" />
      <path d="M106 178c6 8 22 8 28 0" fill="none" stroke="#232629" strokeWidth="6" strokeLinecap="round" />
      <path d="M40 160c-16 2-24 14-22 28" fill="none" stroke="#232629" strokeWidth="6" strokeLinecap="round" />
      <path d="M200 160c16-6 26-20 24-34" fill="none" stroke="#232629" strokeWidth="6" strokeLinecap="round" />
      <circle cx="225" cy="122" r="7" fill="#ff5e24" stroke="#232629" strokeWidth="5" />
    </g>
  );
}
