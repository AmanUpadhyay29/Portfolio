export const site = {
  name: "Aman Upadhyay",
  headline: { job: "Uptime is my job.", habit: "Building is my habit." },
  rolesLine:
    "Database Administrator & Software Engineer · SQL Server · high availability · Python + TypeScript",
  location: "Noida, India",
  links: {
    github: "https://github.com/AmanUpadhyay29",
    linkedin: "https://www.linkedin.com/in/aman-upadhyay-771176-aspirant/",
    email: "amanupadhyay2905@gmail.com",
  },
  resume: { available: false, href: "/resume.pdf" },
  job: {
    title: "Database Administrator",
    employer: "Megamax Services",
    since: "2025-12",
    summary:
      "I keep SQL Server fast, available and recoverable across production, staging and disaster recovery.",
    areas: [
      { name: "Availability", items: ["Always On AGs", "failover cluster instances", "log shipping"] },
      { name: "Recovery", items: ["backups", "point-in-time restore"] },
      {
        name: "Performance",
        items: ["DMVs", "Extended Events", "execution plans", "index maintenance", "tempdb"],
      },
      { name: "Monitoring", items: ["SolarWinds DPA"] },
      { name: "Change management", items: ["SOPs", "Freshservice"] },
      { name: "Platform", items: ["SQL Server 2016/2019/2022"] },
    ],
  },
  experience: [
    { period: "Dec 2025 – now", title: "Database Administrator", org: "Megamax Services" },
    { period: "Aug – Nov 2023", title: "Web Developer Intern", org: "Ethnus" },
  ],
  education: {
    degree: "B.Tech, Computer Science and Engineering (Cloud Computing)",
    school: "VIT Bhopal",
    period: "2021–2025",
  },
  certs: ["AWS Certified Cloud Practitioner", "Python Basics (HackerRank)"],
  skills: [
    {
      group: "SQL Server",
      items: [
        { name: "Always On AGs and failover clusters", where: "at Megamax" },
        { name: "Backup and restore", where: "at Megamax" },
        { name: "Performance tuning", where: "at Megamax" },
        { name: "SolarWinds DPA", where: "at Megamax" },
      ],
    },
    {
      group: "Building",
      items: [
        { name: "Python", where: "the bot fleet" },
        { name: "TypeScript", where: "dashboards and Matrix" },
        { name: "Postgres / TimescaleDB", where: "v1 journals and Matrix" },
      ],
    },
    {
      group: "Ops",
      items: [
        { name: "Docker", where: "Matrix and the trading stack" },
        { name: "PM2", where: "supervising 40+ processes" },
        { name: "Linux", where: "the server the platform runs on" },
        { name: "Claude Code", where: "pair-programming, stated openly" },
      ],
    },
  ],
  about: [
    "I'm a database administrator in Noida. At work I look after SQL Server: availability, backups, recovery and performance.",
    "After hours I build and run an automated trading platform on demo accounts. It is how I practise the same habits as at work: monitoring, backups and calm recovery.",
    "I finished my B.Tech at VIT Bhopal in 2025. When I'm not at a screen, I like travelling.",
  ],
};
