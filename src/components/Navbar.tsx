import { NavLink } from 'react-router-dom';

export function Navbar() {
  return (
    <div className="navbar bg-gradient-to-r from-base-100 to-base-100/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-base-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Layout */}
        <div className="lg:hidden w-full flex items-center justify-between">
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-ghost">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-xl bg-base-100 rounded-box w-52 border border-base-200"
            >
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive
                      ? 'bg-primary text-primary-content'
                      : 'hover:bg-base-200'
                  }
                >
                  <span className="flex items-center gap-2">
                    <span>🔍</span>
                    智慧搜尋
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/all-cards"
                  className={({ isActive }) =>
                    isActive
                      ? 'bg-primary text-primary-content'
                      : 'hover:bg-base-200'
                  }
                >
                  <span className="flex items-center gap-2">
                    <span>💳</span>
                    全部方案
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/my-cards"
                  className={({ isActive }) =>
                    isActive
                      ? 'bg-primary text-primary-content'
                      : 'hover:bg-base-200'
                  }
                >
                  <span className="flex items-center gap-2">
                    <span>👤</span>
                    我的收藏
                  </span>
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Mobile centered logo */}
          <div className="flex-1 flex justify-center">
            <NavLink
              to="/"
              className="btn btn-ghost normal-case text-xl px-2 hover:bg-transparent"
            >
              <span className="text-primary font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Moneier
              </span>
            </NavLink>
          </div>

          <div className="text-xs text-base-content/60 text-right">
            支付優惠比較
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex w-full items-center justify-between">
          {/* Left side navigation */}
          <div className="flex-1">
            <ul className="menu menu-horizontal px-1 gap-2">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive
                      ? 'bg-primary text-primary-content rounded-lg font-medium'
                      : 'hover:bg-base-200 rounded-lg transition-all duration-200'
                  }
                >
                  <span className="flex items-center gap-2">
                    <span>🔍</span>
                    智慧搜尋
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/all-cards"
                  className={({ isActive }) =>
                    isActive
                      ? 'bg-primary text-primary-content rounded-lg font-medium'
                      : 'hover:bg-base-200 rounded-lg transition-all duration-200'
                  }
                >
                  <span className="flex items-center gap-2">
                    <span>💳</span>
                    全部方案
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/my-cards"
                  className={({ isActive }) =>
                    isActive
                      ? 'bg-primary text-primary-content rounded-lg font-medium'
                      : 'hover:bg-base-200 rounded-lg transition-all duration-200'
                  }
                >
                  <span className="flex items-center gap-2">
                    <span>👤</span>
                    我的收藏
                  </span>
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Centered logo */}
          <div className="flex-1 flex justify-center">
            <NavLink
              to="/"
              className="btn btn-ghost normal-case text-2xl px-2 hover:bg-transparent"
            >
              <span className="text-primary font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Moneier
              </span>
            </NavLink>
          </div>

          {/* Right side info */}
          <div className="flex-1 flex justify-end">
            <div className="text-sm text-base-content/60 font-medium">
              支付優惠比較
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
