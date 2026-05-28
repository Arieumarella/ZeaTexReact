import DashboardSummary from "../../components/ecommerce/DashboardSummary";
import SalesChart from "../../components/ecommerce/SalesChart";
import OperationalCostsChart from "../../components/ecommerce/OperationalCostsChart";
import TopSellingItems from "../../components/ecommerce/TopSellingItems";
import TopCustomers from "../../components/ecommerce/TopCustomers";
import UpcomingExpiredTransactions from "../../components/ecommerce/UpcomingExpiredTransactions";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Dashboard - Zea. Textile"
        description="ini adalah halaman dashboard utama Zea. Textile"
      />
      <div className="space-y-6">
        {/* Summary Cards */}
        <DashboardSummary />

        {/* Sales Chart - Full width */}
        <SalesChart />

        {/* Operational Costs, Top Selling, Top Customers */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <OperationalCostsChart />
          <TopSellingItems />
          <TopCustomers />
        </div>

        {/* Upcoming Expired Transactions */}
        <UpcomingExpiredTransactions />
      </div>
    </>
  );
}
