import { useLocation, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="flex px-5 py-3 text-sm text-muted-foreground" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link to="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
        </li>
        {pathnames.map((name, index) => {
          if (name === "dashboard") return null;
          const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

          return (
            <li key={name}>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 mx-1" />
                {isLast ? (
                  <span className="text-foreground font-medium">{formattedName}</span>
                ) : (
                  <Link to={routeTo} className="hover:text-foreground transition-colors">
                    {formattedName}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
