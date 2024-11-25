const Loader = () => {
  return (
    <div className="fixed inset-0 flex h-screen items-center justify-center bg-white bg-opacity-70 backdrop-blur-md z-50">
      <div className="relative">
        {/* Spinner */}
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-gradient-to-r from-blue-500 via-purple-500 to-pink-500 border-t-transparent shadow-lg"></div>

        {/* Center Dot */}
        <div className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 shadow-inner"></div>
      </div>
    </div>
  );
};

export default Loader;
