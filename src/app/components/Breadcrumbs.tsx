import React from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { useLocation, Link } from 'react-router-dom';

const breadcrumbNameMap: { [key: string]: string } = {
  'folders': 'Folders & Reports',
  'schema-explorer': 'Select Data Source',
  'report-builder': 'Report Builder',
  'report-output': 'Report Output',
};

// Defines the standard workflow path for building a report
const pageOrder = ['folders', 'schema-explorer', 'report-builder', 'report-output'];

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(x => x);

    // Don't show breadcrumbs on the dashboard page
    if (location.pathname === '/dashboard' || location.pathname === '/') {
        return null;
    }

    const currentPath = pathnames[0];
    const currentIndexInOrder = pageOrder.indexOf(currentPath);

    // Handle pages not in the standard workflow or if the path is unknown
    if (currentIndexInOrder === -1) {
        const currentPageName = breadcrumbNameMap[currentPath];
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
    }

    // Build the breadcrumb trail based on the workflow order
    const breadcrumbPaths = pageOrder.slice(0, currentIndexInOrder + 1);

    return (
        <Breadcrumb listProps={{ className: 'mb-3' }}>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/dashboard' }}>
                Dashboard
            </Breadcrumb.Item>
            {breadcrumbPaths.map((path) => {
                const isLast = path === currentPath;
                const to = `/${path}`;
                const name = breadcrumbNameMap[path];

                if (!name) return null;

                return isLast ? (
                    <Breadcrumb.Item active key={to}>
                        {name}
                    </Breadcrumb.Item>
                ) : (
                    <Breadcrumb.Item key={to} linkAs={Link} linkProps={{ to }}>
                        {name}
                    </Breadcrumb.Item>
                );
            })}
        </Breadcrumb>
    );
};

export default Breadcrumbs;