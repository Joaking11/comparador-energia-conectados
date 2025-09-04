
// Middleware deshabilitado temporalmente para debugging
// import { withAuth } from "next-auth/middleware";

// export default withAuth(
//   function middleware(req) {
//     // Middleware logic here if needed
//   },
//   {
//     callbacks: {
//       authorized: ({ token, req }) => {
//         // Allow all for now during development
//         return true;
//       },
//     },
//   }
// );

export const config = {
  matcher: [],
};
