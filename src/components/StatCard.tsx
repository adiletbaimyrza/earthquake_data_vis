type StatCardProps = {
  id: string;
  title: string;
  value: string | number | null;
  suffix?: string;
};

const StatCard = ({ id, title, value, suffix = "" }: StatCardProps) => (
  <div id={id} className="card">
    <p className="title">{title}</p>
    <p className="shares title">
      {value}
      {suffix}
    </p>
  </div>
);

export default StatCard;
