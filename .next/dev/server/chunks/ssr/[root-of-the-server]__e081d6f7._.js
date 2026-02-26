module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/AI-projects/newPropertyManagement/property-management/src/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/src/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/querystring [external] (querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/AI-projects/newPropertyManagement/property-management/src/lib/db.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/AI-projects/newPropertyManagement/property-management/node_modules/@prisma/client)");
;
const prisma = new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]();
const __TURBOPACK__default__export__ = prisma;
}),
"[project]/AI-projects/newPropertyManagement/property-management/src/lib/auth.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authOptions",
    ()=>authOptions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/node_modules/next-auth/providers/credentials.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/node_modules/bcryptjs/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/src/lib/db.ts [app-rsc] (ecmascript)");
;
;
;
const authOptions = {
    providers: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])({
            name: "credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email"
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },
            async authorize (credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                const user = await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });
                if (!user || !user.isActive) {
                    return null;
                }
                const isPasswordValid = await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].compare(credentials.password, user.password);
                if (!isPasswordValid) {
                    return null;
                }
                return {
                    id: user.id,
                    email: user.email,
                    name: `${user.firstName} ${user.lastName}`,
                    role: user.role
                };
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt ({ token, user }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session ({ session, token }) {
            if (token) {
                session.user.id = token.sub;
                session.user.role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login"
    }
};
}),
"[project]/AI-projects/newPropertyManagement/property-management/src/components/layout/ModernDashboardLayout.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/AI-projects/newPropertyManagement/property-management/src/components/layout/ModernDashboardLayout.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/AI-projects/newPropertyManagement/property-management/src/components/layout/ModernDashboardLayout.tsx <module evaluation>", "default");
}),
"[project]/AI-projects/newPropertyManagement/property-management/src/components/layout/ModernDashboardLayout.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/AI-projects/newPropertyManagement/property-management/src/components/layout/ModernDashboardLayout.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/AI-projects/newPropertyManagement/property-management/src/components/layout/ModernDashboardLayout.tsx", "default");
}),
"[project]/AI-projects/newPropertyManagement/property-management/src/components/layout/ModernDashboardLayout.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$components$2f$layout$2f$ModernDashboardLayout$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/src/components/layout/ModernDashboardLayout.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$components$2f$layout$2f$ModernDashboardLayout$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/src/components/layout/ModernDashboardLayout.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$components$2f$layout$2f$ModernDashboardLayout$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2d$auth$2f$next$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/node_modules/next-auth/next/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/src/lib/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/src/lib/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$components$2f$layout$2f$ModernDashboardLayout$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/src/components/layout/ModernDashboardLayout.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$BuildingOfficeIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__BuildingOfficeIcon$3e$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/node_modules/@heroicons/react/24/outline/esm/BuildingOfficeIcon.js [app-rsc] (ecmascript) <export default as BuildingOfficeIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$HomeIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__HomeIcon$3e$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/node_modules/@heroicons/react/24/outline/esm/HomeIcon.js [app-rsc] (ecmascript) <export default as HomeIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$UserGroupIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__UserGroupIcon$3e$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/node_modules/@heroicons/react/24/outline/esm/UserGroupIcon.js [app-rsc] (ecmascript) <export default as UserGroupIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$DocumentTextIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__DocumentTextIcon$3e$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/node_modules/@heroicons/react/24/outline/esm/DocumentTextIcon.js [app-rsc] (ecmascript) <export default as DocumentTextIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$CurrencyDollarIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__CurrencyDollarIcon$3e$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/node_modules/@heroicons/react/24/outline/esm/CurrencyDollarIcon.js [app-rsc] (ecmascript) <export default as CurrencyDollarIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$WrenchScrewdriverIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__WrenchScrewdriverIcon$3e$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/node_modules/@heroicons/react/24/outline/esm/WrenchScrewdriverIcon.js [app-rsc] (ecmascript) <export default as WrenchScrewdriverIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChartBarIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__ChartBarIcon$3e$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/node_modules/@heroicons/react/24/outline/esm/ChartBarIcon.js [app-rsc] (ecmascript) <export default as ChartBarIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ArrowTrendingUpIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowTrendingUpIcon$3e$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/node_modules/@heroicons/react/24/outline/esm/ArrowTrendingUpIcon.js [app-rsc] (ecmascript) <export default as ArrowTrendingUpIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$SparklesIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__SparklesIcon$3e$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/node_modules/@heroicons/react/24/outline/esm/SparklesIcon.js [app-rsc] (ecmascript) <export default as SparklesIcon>");
;
;
;
;
;
;
;
async function getDashboardStats(userRole, userId) {
    const stats = {
        properties: 0,
        units: 0,
        tenants: 0,
        activeLeases: 0,
        pendingPayments: 0,
        maintenanceRequests: 0,
        totalRevenue: 0,
        occupancyRate: 0
    };
    if (userRole === "ADMIN") {
        stats.properties = await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].property.count();
        stats.units = await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].unit.count();
        stats.tenants = await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].user.count({
            where: {
                role: "TENANT"
            }
        });
        stats.activeLeases = await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].lease.count({
            where: {
                status: "ACTIVE"
            }
        });
        stats.pendingPayments = await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].payment.count({
            where: {
                status: "PENDING"
            }
        });
        stats.maintenanceRequests = await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].maintenanceRequest.count();
        const occupiedUnits = await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].unit.count({
            where: {
                isOccupied: true
            }
        });
        stats.occupancyRate = stats.units > 0 ? Math.round(occupiedUnits / stats.units * 100) : 0;
        const totalRent = await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].lease.aggregate({
            where: {
                status: "ACTIVE"
            },
            _sum: {
                monthlyRent: true
            }
        });
        stats.totalRevenue = totalRent._sum.monthlyRent || 0;
    } else if (userRole === "EMPLOYEE") {
        stats.properties = await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].property.count({
            where: {
                employees: {
                    some: {
                        employee: {
                            id: userId
                        }
                    }
                }
            }
        });
        stats.units = await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].unit.count({
            where: {
                property: {
                    employees: {
                        some: {
                            employee: {
                                id: userId
                            }
                        }
                    }
                }
            }
        });
        stats.activeLeases = await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].lease.count({
            where: {
                unit: {
                    property: {
                        employees: {
                            some: {
                                employee: {
                                    id: userId
                                }
                            }
                        }
                    }
                },
                status: "ACTIVE"
            }
        });
        stats.pendingPayments = await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].payment.count({
            where: {
                lease: {
                    unit: {
                        property: {
                            employees: {
                                some: {
                                    employee: {
                                        id: userId
                                    }
                                }
                            }
                        }
                    }
                },
                status: "PENDING"
            }
        });
        stats.maintenanceRequests = await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].maintenanceRequest.count({
            where: {
                unit: {
                    property: {
                        employees: {
                            some: {
                                employee: {
                                    id: userId
                                }
                            }
                        }
                    }
                }
            }
        });
        const occupiedUnits = await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].unit.count({
            where: {
                isOccupied: true,
                property: {
                    employees: {
                        some: {
                            employee: {
                                id: userId
                            }
                        }
                    }
                }
            }
        });
        stats.occupancyRate = stats.units > 0 ? Math.round(occupiedUnits / stats.units * 100) : 0;
        const totalRent = await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].lease.aggregate({
            where: {
                status: "ACTIVE",
                unit: {
                    property: {
                        employees: {
                            some: {
                                employee: {
                                    id: userId
                                }
                            }
                        }
                    }
                }
            },
            _sum: {
                monthlyRent: true
            }
        });
        stats.totalRevenue = totalRent._sum.monthlyRent || 0;
    } else if (userRole === "TENANT") {
        stats.activeLeases = await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].lease.count({
            where: {
                tenantId: userId,
                status: "ACTIVE"
            }
        });
        stats.pendingPayments = await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].payment.count({
            where: {
                lease: {
                    tenantId: userId
                },
                status: "PENDING"
            }
        });
        stats.maintenanceRequests = await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].maintenanceRequest.count({
            where: {
                tenantId: userId
            }
        });
    }
    return stats;
}
async function DashboardPage() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2d$auth$2f$next$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authOptions"]);
    if (!session) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/login");
    }
    const stats = await getDashboardStats(session.user.role, session.user.id);
    const statCards = [
        {
            title: "Properties",
            value: stats.properties,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$BuildingOfficeIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__BuildingOfficeIcon$3e$__["BuildingOfficeIcon"],
            color: "from-blue-500 to-cyan-500",
            bgColor: "bg-blue-50",
            textColor: "text-blue-600"
        },
        {
            title: "Units",
            value: stats.units,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$HomeIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__HomeIcon$3e$__["HomeIcon"],
            color: "from-emerald-500 to-teal-500",
            bgColor: "bg-emerald-50",
            textColor: "text-emerald-600"
        },
        {
            title: "Tenants",
            value: stats.tenants,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$UserGroupIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__UserGroupIcon$3e$__["UserGroupIcon"],
            color: "from-purple-500 to-pink-500",
            bgColor: "bg-purple-50",
            textColor: "text-purple-600"
        },
        {
            title: "Active Leases",
            value: stats.activeLeases,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$DocumentTextIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__DocumentTextIcon$3e$__["DocumentTextIcon"],
            color: "from-orange-500 to-red-500",
            bgColor: "bg-orange-50",
            textColor: "text-orange-600"
        },
        {
            title: "Pending Payments",
            value: stats.pendingPayments,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$CurrencyDollarIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__CurrencyDollarIcon$3e$__["CurrencyDollarIcon"],
            color: "from-yellow-500 to-amber-500",
            bgColor: "bg-yellow-50",
            textColor: "text-yellow-600"
        },
        {
            title: "Maintenance",
            value: stats.maintenanceRequests,
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$WrenchScrewdriverIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__WrenchScrewdriverIcon$3e$__["WrenchScrewdriverIcon"],
            color: "from-indigo-500 to-purple-500",
            bgColor: "bg-indigo-50",
            textColor: "text-indigo-600"
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$components$2f$layout$2f$ModernDashboardLayout$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mb-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-3xl font-bold zillow-text-primary",
                                        children: "Dashboard"
                                    }, void 0, false, {
                                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                        lineNumber: 247,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm zillow-text-secondary",
                                        children: [
                                            "Welcome back, ",
                                            session.user.name
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                        lineNumber: 248,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                lineNumber: 246,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "zillow-btn-secondary",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChartBarIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__ChartBarIcon$3e$__["ChartBarIcon"], {
                                                className: "w-4 h-4 mr-2"
                                            }, void 0, false, {
                                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                lineNumber: 252,
                                                columnNumber: 15
                                            }, this),
                                            "Export Report"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                        lineNumber: 251,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "zillow-btn-primary",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$SparklesIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__SparklesIcon$3e$__["SparklesIcon"], {
                                                className: "w-4 h-4 mr-2"
                                            }, void 0, false, {
                                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                lineNumber: 256,
                                                columnNumber: 15
                                            }, this),
                                            "Quick Actions"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                        lineNumber: 255,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                lineNumber: 250,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                        lineNumber: 245,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8",
                        children: statCards.map((stat, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "zillow-stat-card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-medium zillow-text-secondary",
                                                        children: stat.title
                                                    }, void 0, false, {
                                                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                        lineNumber: 268,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-2xl font-bold zillow-text-primary mt-1",
                                                        children: stat.value
                                                    }, void 0, false, {
                                                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                        lineNumber: 269,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                lineNumber: 267,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `w-8 h-8 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(stat.icon, {
                                                    className: "w-4 h-4 text-white"
                                                }, void 0, false, {
                                                    fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                    lineNumber: 272,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                lineNumber: 271,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                        lineNumber: 266,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center text-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ArrowTrendingUpIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowTrendingUpIcon$3e$__["ArrowTrendingUpIcon"], {
                                                className: "w-3 h-3 text-green-600 mr-1"
                                            }, void 0, false, {
                                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                lineNumber: 276,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-green-600 font-medium",
                                                children: "12% from last month"
                                            }, void 0, false, {
                                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                lineNumber: 277,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                        lineNumber: 275,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, index, true, {
                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                lineNumber: 265,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                        lineNumber: 263,
                        columnNumber: 9
                    }, this),
                    (session.user.role === "ADMIN" || session.user.role === "EMPLOYEE") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "zillow-stat-card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-lg font-semibold zillow-text-primary",
                                                children: "Monthly Revenue"
                                            }, void 0, false, {
                                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                lineNumber: 288,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$CurrencyDollarIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__CurrencyDollarIcon$3e$__["CurrencyDollarIcon"], {
                                                    className: "w-4 h-4 text-white"
                                                }, void 0, false, {
                                                    fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                    lineNumber: 290,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                lineNumber: 289,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                        lineNumber: 287,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-3xl font-bold zillow-text-primary",
                                        children: [
                                            "$",
                                            stats.totalRevenue.toLocaleString()
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                        lineNumber: 293,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between text-sm mb-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "zillow-text-secondary",
                                                        children: "This month"
                                                    }, void 0, false, {
                                                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                        lineNumber: 296,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-green-600 font-medium",
                                                        children: "+8.5%"
                                                    }, void 0, false, {
                                                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                        lineNumber: 297,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                lineNumber: 295,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-full bg-gray-200 rounded-full h-2",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "bg-green-600 h-2 rounded-full",
                                                    style: {
                                                        width: '75%'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                    lineNumber: 300,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                lineNumber: 299,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                        lineNumber: 294,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                lineNumber: 286,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "zillow-stat-card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-lg font-semibold zillow-text-primary",
                                                children: "Occupancy Rate"
                                            }, void 0, false, {
                                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                lineNumber: 307,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$HomeIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__HomeIcon$3e$__["HomeIcon"], {
                                                    className: "w-4 h-4 text-white"
                                                }, void 0, false, {
                                                    fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                    lineNumber: 309,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                lineNumber: 308,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                        lineNumber: 306,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-3xl font-bold zillow-text-primary",
                                        children: [
                                            stats.occupancyRate,
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                        lineNumber: 312,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between text-sm mb-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "zillow-text-secondary",
                                                        children: "Occupied units"
                                                    }, void 0, false, {
                                                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                        lineNumber: 315,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-blue-600 font-medium",
                                                        children: [
                                                            stats.units > 0 ? Math.round(stats.units * stats.occupancyRate / 100) : 0,
                                                            " / ",
                                                            stats.units
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                        lineNumber: 316,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                lineNumber: 314,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-full bg-gray-200 rounded-full h-2",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "bg-blue-600 h-2 rounded-full",
                                                    style: {
                                                        width: `${stats.occupancyRate}%`
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                    lineNumber: 319,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                lineNumber: 318,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                        lineNumber: 313,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                lineNumber: 305,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                        lineNumber: 285,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "zillow-card p-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-semibold zillow-text-primary mb-4",
                                children: "Quick Actions"
                            }, void 0, false, {
                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                lineNumber: 328,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200 group",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$BuildingOfficeIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__BuildingOfficeIcon$3e$__["BuildingOfficeIcon"], {
                                                className: "w-4 h-4 text-blue-600 mb-2 group-hover:scale-110 transition-transform"
                                            }, void 0, false, {
                                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                lineNumber: 331,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-medium zillow-text-primary",
                                                children: "Add Property"
                                            }, void 0, false, {
                                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                lineNumber: 332,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                        lineNumber: 330,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "p-3 bg-white border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all duration-200 group",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$UserGroupIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__UserGroupIcon$3e$__["UserGroupIcon"], {
                                                className: "w-4 h-4 text-green-600 mb-2 group-hover:scale-110 transition-transform"
                                            }, void 0, false, {
                                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                lineNumber: 335,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-medium zillow-text-primary",
                                                children: "Add Tenant"
                                            }, void 0, false, {
                                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                lineNumber: 336,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                        lineNumber: 334,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all duration-200 group",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$DocumentTextIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__DocumentTextIcon$3e$__["DocumentTextIcon"], {
                                                className: "w-4 h-4 text-purple-600 mb-2 group-hover:scale-110 transition-transform"
                                            }, void 0, false, {
                                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                lineNumber: 339,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-medium zillow-text-primary",
                                                children: "Create Lease"
                                            }, void 0, false, {
                                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                lineNumber: 340,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                        lineNumber: 338,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "p-3 bg-white border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-md transition-all duration-200 group",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$WrenchScrewdriverIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__WrenchScrewdriverIcon$3e$__["WrenchScrewdriverIcon"], {
                                                className: "w-4 h-4 text-orange-600 mb-2 group-hover:scale-110 transition-transform"
                                            }, void 0, false, {
                                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                lineNumber: 343,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-medium zillow-text-primary",
                                                children: "Maintenance"
                                            }, void 0, false, {
                                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                                lineNumber: 344,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                        lineNumber: 342,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                                lineNumber: 329,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                        lineNumber: 327,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
                lineNumber: 244,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
            lineNumber: 242,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx",
        lineNumber: 241,
        columnNumber: 5
    }, this);
}
}),
"[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/src/app/dashboard/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e081d6f7._.js.map