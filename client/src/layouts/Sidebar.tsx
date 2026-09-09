import * as React from 'react';
import GlobalStyles from '@mui/joy/GlobalStyles';
import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton, { listItemButtonClasses } from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMe } from '../app/meContext';
import { closeSidebar } from './utils';
import AppUserProfile from './AppUserProfile';

const dictRoutes = ['/persons', '/users', '/blacklist'];

function Toggler({
  defaultExpanded = false,
  renderToggle,
  children,
}: {
  defaultExpanded?: boolean;
  children: React.ReactNode;
  renderToggle: (params: {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultExpanded);
  return (
    <React.Fragment>
      {renderToggle({ open, setOpen })}
      <Box
        sx={[
          {
            display: 'grid',
            transition: '0.2s ease',
            '& > *': { overflow: 'hidden' },
          },
          open ? { gridTemplateRows: '1fr' } : { gridTemplateRows: '0fr' },
        ]}
      >
        {children}
      </Box>
    </React.Fragment>
  );
}

export default function Sidebar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const me = useMe();

  return (
    <Sheet
      className="Sidebar"
      sx={{
        position: { xs: 'fixed', md: 'sticky' },
        transform: {
          xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))',
          md: 'none',
        },
        transition: 'transform 0.4s, width 0.4s',
        zIndex: 100,
        height: '100dvh',
        width: 'var(--Sidebar-width)',
        top: 0,
        p: 2,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      <GlobalStyles
        styles={(theme) => ({
          ':root': {
            '--Sidebar-width': '220px',
            [theme.breakpoints.up('lg')]: {
              '--Sidebar-width': '240px',
            },
          },
        })}
      />
      <Box
        className="Sidebar-overlay"
        sx={{
          position: 'fixed',
          zIndex: 9998,
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          opacity: 'var(--SideNavigation-slideIn)',
          backgroundColor: 'var(--joy-palette-background-backdrop)',
          transition: 'opacity 0.4s',
          transform: {
            xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))',
            lg: 'translateX(-100%)',
          },
        }}
        onClick={() => closeSidebar()}
      />
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Typography level="title-lg">{t('sidebar.title')}</Typography>
      </Box>
      <Divider />
      <Box
        sx={{
          minHeight: 0,
          overflow: 'hidden auto',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          [`& .${listItemButtonClasses.root}`]: {
            gap: 1.5,
          },
        }}
      >
        <List
          size="sm"
          sx={{
            gap: 1,
            '--List-nestedInsetStart': '30px',
            '--ListItem-radius': (theme) => theme.vars.radius.sm,
          }}
        >
          <ListItem>
            <ListItemButton component={Link} to="/" selected={pathname === '/'}>
              <HomeOutlinedIcon />
              <ListItemContent>
                <Typography level="title-sm">{t('sidebar.home')}</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton component={Link} to="/my-requests" selected={pathname === '/my-requests'}>
              <AssignmentIndOutlinedIcon />
              <ListItemContent>
                <Typography level="title-sm">{t('sidebar.myRequests')}</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton component={Link} to="/requests" selected={pathname === '/requests'}>
              <FormatListBulletedIcon />
              <ListItemContent>
                <Typography level="title-sm">{t('sidebar.allRequests')}</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>

          {/* Справочники в BpDazApp были видны только администратору. */}
          {me?.isAdmin && (
            <ListItem nested>
              <Toggler
                defaultExpanded={dictRoutes.includes(pathname)}
                renderToggle={({ open, setOpen }) => (
                  <ListItemButton onClick={() => setOpen(!open)}>
                    <MenuBookOutlinedIcon />
                    <ListItemContent>
                      <Typography level="title-sm">{t('sidebar.dictionaries')}</Typography>
                    </ListItemContent>
                    <KeyboardArrowDownIcon
                      sx={[open ? { transform: 'rotate(180deg)' } : { transform: 'none' }]}
                    />
                  </ListItemButton>
                )}
              >
                <List sx={{ gap: 0.5 }}>
                  <ListItem sx={{ mt: 0.5 }}>
                    <ListItemButton component={Link} to="/persons" selected={pathname === '/persons'}>
                      {t('sidebar.persons')}
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton component={Link} to="/users" selected={pathname === '/users'}>
                      {t('sidebar.users')}
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton component={Link} to="/blacklist" selected={pathname === '/blacklist'}>
                      {t('sidebar.blacklist')}
                    </ListItemButton>
                  </ListItem>
                </List>
              </Toggler>
            </ListItem>
          )}
        </List>
      </Box>
      <Divider />
      <AppUserProfile />
    </Sheet>
  );
}
