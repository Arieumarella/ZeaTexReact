import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon
} from "../icons";
import { FontAwesomeIcon } from "../icons";
import { faArrowTrendDown, faBoxesStacked, faArrowTrendUp, faMoneyCheckDollar, faAddressCard, faGears } from '@fortawesome/free-solid-svg-icons';
import { useSidebar } from "../context/SidebarContext";


type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  relatedPaths?: string[]; // Paths yang berhubungan
  subItems?: { name: string; path: string; relatedPaths?: string[]; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/Home",
  },
  {
    icon: <FontAwesomeIcon icon={faBoxesStacked} />,
    name: "Stok Barang",
    path: "/stok-barang",
    relatedPaths: ["/tambah-stok", "/edit-stok"],
  },
  {
    icon: <FontAwesomeIcon icon={faArrowTrendDown} />,
    name: "Barang Masuk",
    path: "/barang-masuk",
    relatedPaths: ["/tambah-masuk", "/edit-masuk", "/detail-masuk", "/input-cicilan", "/retur-masuk"],
  },


  {
    icon: <FontAwesomeIcon icon={faArrowTrendUp} />,
    name: "Barang Keluar",
    path: "/barang-keluar",
    relatedPaths: ["/tambah-keluar", "/edit-keluar", "/detail-keluar", "/input-cicilan-keluar", "/retur-keluar"],
  },

  {
    icon: <FontAwesomeIcon icon={faMoneyCheckDollar} />,
    name: "Biaya Operasional",
    path: "/biaya-operasional",
    relatedPaths: ["/tambah-biaya", "/edit-biaya"],
  },

  {
    icon: <FontAwesomeIcon icon={faAddressCard} />,
    name: "Profile Toko",
    path: "/profile",
    relatedPaths: ["/profile"],
  },

  {
    icon: <FontAwesomeIcon icon={faGears} />,
    name: "Konfigurasi WhatsApp",
    path: "/konfigurasi-whatsapp",
    relatedPaths: ["/konfigurasi-whatsapp"],
  },


  {
    name: "Assets Management",
    icon: <ListIcon />,
    subItems: [
      { name: "Manajemen User", path: "/manajemen-user", relatedPaths: ["/tambah-manajemen-user", "/edit-manajemen-user"], pro: false },
      { name: "Manajemen Pelanggan", path: "/manajemen-pelanggan", relatedPaths: ["/tambah-manajemen-pelanggan", "/edit-manajemen-pelanggan"], pro: false },
      { name: "Manajemen Supplier", path: "/manajemen-supplier", relatedPaths: ["/tambah-manajemen-supplier", "/edit-manajemen-supplier"], pro: false },
      { name: "Manajemen List barang", path: "/manajemen-list-barang", relatedPaths: ["/tambah-manajemen-list-barang", "/edit-manajemen-list-barang"], pro: false },
    ],
  },


];

const othersItems: NavItem[] = [

];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string, relatedPaths?: string[]) => {
      const currentPath = location.pathname;
      // Exact match atau jika current path dimulai dengan path (untuk sub-pages)
      const isMainPathActive = currentPath === path || currentPath.startsWith(path + "/");

      // Check relatedPaths
      if (relatedPaths && relatedPaths.length > 0) {
        const isRelatedPathActive = relatedPaths.some(
          (relPath) => currentPath === relPath || currentPath.startsWith(relPath + "/")
        );
        return isMainPathActive || isRelatedPathActive;
      }

      return isMainPathActive;
    },
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path, subItem.relatedPaths)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`menu-item-icon-size  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path, nav.relatedPaths) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`menu-item-icon-size ${isActive(nav.path, nav.relatedPaths)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path, subItem.relatedPaths)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path, subItem.relatedPaths)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path, subItem.relatedPaths)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="py-4 flex justify-center">
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex flex-col items-center w-full">
              <div className="w-full">
                <div className="mx-auto w-full max-w-[360px] bg-white/90 dark:bg-white/90 backdrop-blur-md rounded-3xl p-5 pt-0.5 shadow-md border border-gray-100 dark:border-gray-700 text-center">
                  <div className="flex justify-center">
                    <img
                      className="h-32 w-auto block dark:hidden mx-auto"
                      src="/images/logo aji transparant.svg"
                      alt="Zea Textile Logo"
                      style={{ objectFit: 'contain' }}
                    />
                    <img
                      className="h-32 w-auto hidden dark:block mx-auto"
                      src="/images/logo aji transparant.svg"
                      alt="Zea Textile Logo"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <div className="mt-0">
                    <div className="text-lg text-gray-800 dark:text-gray-800 font-semibold">Zea Textile</div>
                    <div className="text-sm text-gray-500 dark:text-gray-500">Textile Supplier</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center w-full bg-gradient-to-r from-blue-100 via-white to-blue-50 dark:from-blue-950 dark:via-blue-900 dark:to-blue-950 rounded-full shadow-md p-6">
              <img
                src="/images/logo aji transparant.svg"
                alt="Logo"
                width={128}
                height={128}
                style={{ objectFit: 'contain' }}
                className="drop-shadow-md block mx-auto"
              />
            </div>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >

              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>

      </div>
    </aside>
  );
};

export default AppSidebar;
