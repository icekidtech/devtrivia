import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to DevTrivia</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300">
        DevTrivia is a real-time, interactive quiz platform designed for tech enthusiasts. 
        Challenge your knowledge, compete with others, and have fun!
      </p>
      <div className="mt-8">
        <Link
          href="/signup"
          className="bg-primary text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition duration-300"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}