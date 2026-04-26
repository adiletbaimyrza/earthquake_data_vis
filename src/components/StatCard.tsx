type StatCardProps = {
  id: string;
  title: string;
  value: string | number | null;
  suffix?: string;
};

const StatCard = ({ id, title, value, suffix = "" }: StatCardProps) => (
  <div id={id} className="card stat-card">
    <p className="panel-kicker">Selection Metric</p>
    <p className="panel-title">{title}</p>
    <p className="shares stat-value">
      {value ?? "0"}
      {suffix}
    </p>
  </div>
);

export default StatCard;
