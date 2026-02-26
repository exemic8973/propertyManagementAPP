module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/AI-projects/newPropertyManagement/property-management/src/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/src/app/layout.tsx [app-rsc] (ecmascript)"));
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
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SetupTestPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/src/lib/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/node_modules/bcryptjs/index.js [app-rsc] (ecmascript)");
;
;
;
async function SetupTestPage() {
    try {
        // Create admin user
        const hashedPassword = await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].hash('test123', 12);
        const admin = await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].user.create({
            data: {
                email: 'admin@propertyhub.com',
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                role: 'ADMIN'
            }
        });
        // Create sample property
        const property = await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].property.create({
            data: {
                name: 'Sunset Apartments',
                address: '123 Main St',
                city: 'Anytown',
                state: 'CA',
                zipCode: '12345',
                type: 'Apartment',
                description: 'A beautiful apartment complex'
            }
        });
        // Create sample unit
        const unit = await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].unit.create({
            data: {
                unitNumber: 'A101',
                bedrooms: 2,
                bathrooms: 2,
                squareFeet: 1000,
                rentAmount: 1500,
                propertyId: property.id
            }
        });
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen gradient-bg p-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-4xl mx-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "glass-morphism rounded-2xl p-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-3xl font-bold text-green-600 mb-4",
                            children: "✅ Database Setup Successful!"
                        }, void 0, false, {
                            fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx",
                            lineNumber: 48,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-4 bg-green-50 rounded-xl",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold text-green-800",
                                            children: "Admin User Created:"
                                        }, void 0, false, {
                                            fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx",
                                            lineNumber: 51,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            children: "Email: admin@propertyhub.com"
                                        }, void 0, false, {
                                            fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx",
                                            lineNumber: 52,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            children: "Password: test123"
                                        }, void 0, false, {
                                            fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx",
                                            lineNumber: 53,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx",
                                    lineNumber: 50,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-4 bg-blue-50 rounded-xl",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold text-blue-800",
                                            children: "Sample Property:"
                                        }, void 0, false, {
                                            fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx",
                                            lineNumber: 56,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            children: [
                                                property.name,
                                                " - ",
                                                property.address
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx",
                                            lineNumber: 57,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx",
                                    lineNumber: 55,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-4 bg-purple-50 rounded-xl",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold text-purple-800",
                                            children: "Sample Unit:"
                                        }, void 0, false, {
                                            fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx",
                                            lineNumber: 60,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            children: [
                                                unit.unitNumber,
                                                " - $",
                                                unit.rentAmount,
                                                "/month"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx",
                                            lineNumber: 61,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx",
                                    lineNumber: 59,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx",
                            lineNumber: 49,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-8",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "/login",
                                className: "btn-primary inline-block",
                                children: "Go to Login"
                            }, void 0, false, {
                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx",
                                lineNumber: 65,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx",
                            lineNumber: 64,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx",
                    lineNumber: 47,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx",
                lineNumber: 46,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx",
            lineNumber: 45,
            columnNumber: 7
        }, this);
    } catch (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen gradient-bg p-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-4xl mx-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "glass-morphism rounded-2xl p-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-3xl font-bold text-red-600 mb-4",
                            children: "❌ Setup Error"
                        }, void 0, false, {
                            fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx",
                            lineNumber: 78,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-600",
                            children: error instanceof Error ? error.message : 'Unknown error occurred'
                        }, void 0, false, {
                            fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx",
                            lineNumber: 79,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-8",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "/",
                                className: "btn-secondary inline-block",
                                children: "Back to Home"
                            }, void 0, false, {
                                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx",
                                lineNumber: 83,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx",
                            lineNumber: 82,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx",
                    lineNumber: 77,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx",
                lineNumber: 76,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx",
            lineNumber: 75,
            columnNumber: 7
        }, this);
    } finally{
        await __TURBOPACK__imported__module__$5b$project$5d2f$AI$2d$projects$2f$newPropertyManagement$2f$property$2d$management$2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].$disconnect();
    }
}
}),
"[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/AI-projects/newPropertyManagement/property-management/src/app/setup-test/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9c9076ac._.js.map