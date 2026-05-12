export default function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
      <div className="w-full max-w-sm px-8 py-10 bg-white rounded-2xl shadow-sm border border-[#E8E0D5] text-center">
        <h1 className="text-2xl font-serif text-[#2C1810] mb-1">Chère</h1>
        <p className="text-sm text-[#8B7355] mb-8">Private preview</p>
        <form action="/api/unlock" method="POST" className="space-y-4 text-left">
          <input type="hidden" name="from" value="" id="from-field" />
          <div>
            <label className="block text-xs font-medium text-[#8B7355] mb-1">
              Username
            </label>
            <input
              name="username"
              type="text"
              autoComplete="username"
              required
              className="w-full px-3 py-2 border border-[#E8E0D5] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#C4A882]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8B7355] mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-3 py-2 border border-[#E8E0D5] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#C4A882]"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-[#2C1810] text-white text-sm rounded-lg hover:bg-[#3D2415] transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.getElementById('from-field').value = new URLSearchParams(location.search).get('from') || '/';`,
        }}
      />
    </div>
  );
}
