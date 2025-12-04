import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";


import Home from "./pages/Dashboard/Home";

import StokBarang from "./pages/StokBarang/StokBarang";
{/* Barang Masuk */}
import BarangMasuk from "./pages/BarangMasuk/BarangMasuk";
import TambahMasuk from "./pages/BarangMasuk/TambahMasuk";
import EditMasuk from "./pages/BarangMasuk/EditMasuk";
import DetailMasuk from "./pages/BarangMasuk/DetailMasuk";
import ReturMasuk from "./pages/BarangMasuk/ReturMasuk";
{/* Barang Keluar */}
import BarangKeluar from "./pages/BarangKeluar/BarangKeluar";
import TambahKeluar from "./pages/BarangKeluar/TambahKeluar";
import EditKeluar from "./pages/BarangKeluar/EditKeluar";
import DetailKeluar from "./pages/BarangKeluar/DetailKeluar";
import ReturKeluar from "./pages/BarangKeluar/ReturKeluar";
{/* Biaya Operasional */}
import BiayaOprasional from "./pages/BiayaOprasional/BiayaOprasional";
import TambahBiaya from "./pages/BiayaOprasional/TambahBiaya";
import EditBiaya from "./pages/BiayaOprasional/EditBiaya";
{/* Manajemen User */}
import ManajemenUser from "./pages/Manajemen/ManajemenUser";
import TambahManajemenUser from "./pages/Manajemen/TambahManajemenUser";
import EditManajemenUser from "./pages/Manajemen/EditManajemenUser";
{/* Manajemen Pelanggan */}
import ManajemenPelanggan from "./pages/Manajemen/ManajemenPelanggan";
import TambahManajemenPelanggan from "./pages/Manajemen/TambahManajemenPelanggan";
import EditManajemenPelanggan from "./pages/Manajemen/EditManajemenPelanggan";
{/* Manajemen Supplier */}
import ManajemenSupplier from "./pages/Manajemen/ManajemenSupplier";
import TambahManajemenSupplier from "./pages/Manajemen/TambahManajemenSupplier";
import EditManajemenSupplier from "./pages/Manajemen/EditManajemenSupplier";
{/* Manajemen List Barang */}
import ManajemenListBarang from "./pages/Manajemen/ManajemenListBarang";
import TambahManajemenListBarang from "./pages/Manajemen/TambahManajemenListBarang";
import EditManajemenListBarang from "./pages/Manajemen/EditManajemenListBarang";
{/* Input Cicilan */}
import InputCicilan from "./pages/BarangMasuk/InputCicilan";
import InputCicilanKeluar from "./pages/BarangKeluar/InputCicilanKeluar";
{/* konfigurasi WhatsApp */}
import KonfigWA from "./pages/konfigWA/Wa";
{/* Profile */}
import Profile from "./pages/Profile/Profile";


export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<SignIn />} />
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            
            <Route path="/home" element={<Home />} />
            <Route path="/stok-barang" element={<StokBarang />} />

            {/* Tambah Barang Masuk */}
            <Route path="/barang-masuk" element={<BarangMasuk />} />
            <Route path="/tambah-masuk" element={<TambahMasuk />} />
            <Route path="/edit-masuk/:id" element={<EditMasuk />} />
            <Route path="/detail-masuk/:id" element={<DetailMasuk />} />
            <Route path="/retur-masuk/:id" element={<ReturMasuk />} />
            <Route path="/input-cicilan/:id" element={<InputCicilan />} />

            {/* Barang Keluar */}
            <Route path="/barang-keluar" element={<BarangKeluar />} />
            <Route path="/tambah-keluar" element={<TambahKeluar />} />
            <Route path="/edit-keluar/:id" element={<EditKeluar />} />
            <Route path="/detail-keluar/:id" element={<DetailKeluar />} />
            <Route path="/retur-keluar/:id" element={<ReturKeluar />} />
            <Route path="/input-cicilan-keluar/:id" element={<InputCicilanKeluar />} />

            {/* Biaya Oprasional */}
            <Route path="/biaya-operasional" element={<BiayaOprasional />} />
            <Route path="/tambah-biaya" element={<TambahBiaya />} />
            <Route path="/edit-biaya/:id" element={<EditBiaya />} />

            {/*manajemen  User*/}
            <Route path="/manajemen-user" element={<ManajemenUser />} />
            <Route path="/tambah-manajemen-user" element={<TambahManajemenUser />} />
            <Route path="/edit-manajemen-user/:id" element={<EditManajemenUser />} />

            {/*manajemen  Pelanggan*/}
            <Route path="/manajemen-pelanggan" element={<ManajemenPelanggan />} />
            <Route path="/tambah-manajemen-pelanggan" element={<TambahManajemenPelanggan />} />
            <Route path="/edit-manajemen-pelanggan/:id" element={<EditManajemenPelanggan />} />

            {/*manajemen  Supplier*/}
            <Route path="/manajemen-supplier" element={<ManajemenSupplier />} />
            <Route path="/tambah-manajemen-supplier" element={<TambahManajemenSupplier />} />
            <Route path="/edit-manajemen-supplier/:id" element={<EditManajemenSupplier />} />  


            {/*manajemen  List Barang*/}
            <Route path="/manajemen-list-barang" element={<ManajemenListBarang />} />
            <Route path="/tambah-manajemen-list-barang" element={<TambahManajemenListBarang />} />
            <Route path="/edit-manajemen-list-barang/:id" element={<EditManajemenListBarang />} />
            {/* konfigurasi WhatsApp */}
            <Route path="/konfigurasi-whatsapp" element={<KonfigWA />} />
            {/* Profile */}
            <Route path="/profile" element={<Profile />} />



            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
