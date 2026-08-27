"use client";

export default function Error() {
  return (
    <div className="max-w-md p-6 mx-auto bg-white dark:bg-black border border-gray-200 rounded-lg shadow-md">
      <h2 className="mb-4 text-xl font-bold text-center text-gray-900 dark:text-gray-100">
        Database Error
      </h2>
      <p className="text-gray-700">
        The database query failed. Verify your connection and run{" "}
        <code className="p-1 font-mono text-green-600 bg-gray-200 dark:bg-gray-800 rounded">
          pnpm db:setup
        </code>{" "}
        to create and seed the schema if needed.
      </p>
    </div>
  );
}
