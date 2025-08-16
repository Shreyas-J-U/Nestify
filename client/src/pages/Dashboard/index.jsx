import useDashboard from "./useDashboard";
import DashboardUI from "./DashboardUI";

export default function Dashboard() {
  const dashboardProps = useDashboard();
  return <DashboardUI {...dashboardProps} />;
}
