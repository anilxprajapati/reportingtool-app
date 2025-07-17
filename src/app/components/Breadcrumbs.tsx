import React from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { useLocation, Link } from 'react-router-dom';

const breadcrumbNameMap: { [key: string]: string } = {
  'folders': 'Folders & Reports',
  'schema-explorer': 'Select Data Source',
  'report-builder': 'Report Builder',
  'report-output': 'Report Output',
};

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(x => x);

    // Don't show breadcrumbs on the dashboard page
    if (location.pathname === '/dashboard' || location.pathname === '/') {
        return null;
    }

    const lastPathSegment = pathnames[pathnames.length - 1];
    const currentPageName = breadcrumbNameMap[lastPathSegment];

    if (!currentPageName) {
        return null; // Don't render if the path is not in our map
    }

    return (
        <Breadcrumb listProps={{ className: 'mb-3' }}>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/dashboard' }}>
                Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item active>
                {currentPageName}
            </Breadcrumb.Item>
        </Breadcrumb>
    );
};

export default Breadcrumbs;
