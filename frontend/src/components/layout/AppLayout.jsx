import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen" style={{ background: '#0F1117' }}>
      <Sidebar />
      <main className="flex-1 lg:ml-64 min-h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 pt-16 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
