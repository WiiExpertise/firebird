export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 min-h-screen p-4">
        <div className="text-2xl font-bold mb-8">Firebird</div>
        <nav className="space-y-4">
          <div>
            <h3 className="font-semibold uppercase text-gray-400 text-sm mb-2">Tweets of disaster</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-3">
                <span className="bg-gray-700 w-8 h-8 flex items-center justify-center rounded-lg">🏠</span>
                <a href="#" className="hover:text-gray-300">House is fire tweet</a>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="space-x-4">
            <button className="bg-gray-800 p-2 rounded-full">🔔</button>
            <button className="bg-gray-800 p-2 rounded-full">🌙</button>
          </div>
        </header>

        {/* Overview Boxes */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">Predifined tab of disaster</div>
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">Predifined tab of disaster</div>
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">Predifined tab of disaster</div>
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">Predifined tab of disaster</div>
        </section>
      </main>
    </div>
  );
}
