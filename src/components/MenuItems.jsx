import {
    ClipboardList,
    Users,
    Settings,
    UserCog,
    Shield,
    FileText,
} from "lucide-react";

export const MenuItems = [
    {
        label: "Leads",
        icon: ClipboardList,
        key: "leads",
        path: "/leads",
        active: true,
    },
    // {
    //     label: "Customers",
    //     icon: Users,
    //     key: "customers",
    //     path: "/customer",
    // },
    {
        label: "Manage Users",
        icon: Settings,
        key: "manage_users",
        children: [
            {
                label: "Users",
                icon: UserCog,
                key: "users",
                path: "/users",
            },
            // {
            //     label: "Roles",
            //     icon: Shield,
            //     key: "roles",
            //     path: "/roles",
            // },
            // {
            //     label: "Permissions",
            //     icon: Shield,
            //     key: "permissions",
            //     path: "/permissions",
            // },
        ],
    },
    {
        label: "Report",
        icon: FileText,
        key: "reports",
        path: "/report",
    },
    // {
    //     label: "Assigee",
    //     icon: Users,
    //     key: "assige-list",
    //     path: "/assige-list",
    // },
];
