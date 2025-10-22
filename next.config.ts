// next.config.mjs
import type { Configuration as WebpackConfiguration } from 'webpack';
import type { WebpackConfigContext } from 'next/dist/server/config-shared'; // Import context type

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add any other Next.js specific configurations here if needed
  // reactStrictMode: true, // Example

  webpack: (
    config: WebpackConfiguration, // Type annotation for config
    context: WebpackConfigContext // Type annotation for context
  ) => {
    // Destructure isServer, prefix with underscore if not used
    const { isServer: _isServer } = context;

    // Ensure externals array exists
    if (!Array.isArray(config.externals)) {
      // If externals is not already an array, initialize it as one.
      // If it exists but is not an array (e.g., an object or function),
      // decide how to handle it. For simplicity now, we'll overwrite.
      config.externals = [];
    }

    // Add Knex optional dependencies to externals to prevent build errors
    config.externals.push({
      'better-sqlite3': 'commonjs better-sqlite3',
      'mysql': 'commonjs mysql',
      'mysql2': 'commonjs mysql2',
      'oracledb': 'commonjs oracledb',
      'pg-query-stream': 'commonjs pg-query-stream',
      'sqlite3': 'commonjs sqlite3',
      'tedious': 'commonjs tedious',
    });

    // Important: return the modified config
    return config;
  },
};

export default nextConfig;