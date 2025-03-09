import Link from "next/link";
import React from "react";

const MenuBar: React.FC = () => {
  return (
    <header className="bg-[#DB3737] text-white p-4 w-full fixed top-0 left-0 z-50 rounded-t-2xl rounded-b-2xl">
      <div className="flex justify-between items-center">
        <Link href="/dashboard">
          <h1 className="text-2xl font-bold text-white">🔥 Firebird</h1>
        </Link>
        <nav className="space-x-4">
          <Link href="/alldisasters">
            <button className="hover:underline text-white">All Disasters</button>
          </Link>
          <Link href="/map">
            <button className="hover:underline text-white">Map</button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default MenuBar;
