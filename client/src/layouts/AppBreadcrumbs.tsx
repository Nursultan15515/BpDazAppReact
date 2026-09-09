import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Typography from "@mui/joy/Typography";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface RouteNode {
  labelKey: string;
  parent?: string;
  /** нет реального маршрута — не кликабельно */
  virtual?: boolean;
}

const routeMap: Record<string, RouteNode> = {
  "/": { labelKey: "sidebar.home" },

  "/_visitors": { labelKey: "sidebar.visitors", parent: "/", virtual: true },
  "/requests": { labelKey: "breadcrumbs.requests", parent: "/_visitors" },
  "/my-requests": { labelKey: "breadcrumbs.myRequests", parent: "/_visitors" },

  "/_dicts": { labelKey: "sidebar.dictionaries", parent: "/", virtual: true },
  "/persons": { labelKey: "sidebar.persons", parent: "/_dicts" },
  "/users": { labelKey: "sidebar.users", parent: "/_dicts" },
  "/blacklist": { labelKey: "sidebar.blacklist", parent: "/_dicts" },
};

function buildChain(pathname: string): { path: string; node: RouteNode }[] {
  const key = pathname === "/" ? "/" : pathname.replace(/\/$/, "");

  const chain: { path: string; node: RouteNode }[] = [];
  let current: string | undefined = routeMap[key] ? key : undefined;

  while (current) {
    const node: RouteNode | undefined = routeMap[current];
    if (!node) break;
    chain.unshift({ path: current, node });
    current = node.parent;
  }

  return chain;
}

export default function AppBreadcrumbs() {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  if (pathname === "/") return null;

  const chain = buildChain(pathname);

  return (
    <Breadcrumbs
      size="sm"
      aria-label="breadcrumbs"
      separator={<ChevronRightRoundedIcon fontSize="small" />}
      sx={{ px: 2, py: 0.75 }}
    >
      {chain.map(({ path, node }, index) => {
        const isLast = index === chain.length - 1;
        const isHome = path === "/";

        if (isLast) {
          return (
            <Typography key={path} color="primary" fontWeight={500} fontSize="sm">
              {isHome ? <HomeRoundedIcon fontSize="small" sx={{ verticalAlign: "middle" }} /> : t(node.labelKey)}
            </Typography>
          );
        }

        if (node.virtual) {
          return (
            <Typography key={path} fontSize="sm" sx={{ color: "text.tertiary" }}>
              {t(node.labelKey)}
            </Typography>
          );
        }

        return (
          <Link
            key={path}
            component={RouterLink}
            to={path}
            color="neutral"
            fontSize="sm"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            {isHome ? <HomeRoundedIcon fontSize="small" /> : t(node.labelKey)}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
