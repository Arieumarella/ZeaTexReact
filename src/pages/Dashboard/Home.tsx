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

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sales Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <SalesChart />
          </div>

          {/* Top Selling Items - Minimal height */}
          <div className="lg:col-span-1">
            <TopSellingItems />
          </div>
        </div>

        {/* Operational Costs & More Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Operational Costs */}
          <OperationalCostsChart />

          {/* Top Customers */}
          <TopCustomers />
        </div>

        {/* Upcoming Expired Transactions */}
        <UpcomingExpiredTransactions />
      </div>
    </>
  );
}
