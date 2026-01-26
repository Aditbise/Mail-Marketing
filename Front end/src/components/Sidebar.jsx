import { Link } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Zap, Info } from 'lucide-react';

function Sidebar({ isOpen, onToggle }) {
  return (
    <div className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border-r border-lime-500/20 z-50 transition-all duration-300 flex flex-col ${isOpen ? 'w-64' : 'w-20'}`}>
      {/* Header with Toggle */}
      <div className='flex items-center justify-between px-4 py-5 border-b border-lime-500/20'>
        {isOpen && (
          <h1 className='text-lg font-bold bg-gradient-to-r from-lime-400 to-lime-500 bg-clip-text text-transparent'>
            Menu
          </h1>
        )}
        <button 
          onClick={onToggle} 
          className='p-2.5 hover:bg-lime-500/10 rounded-lg transition-all duration-200 text-lime-500 hover:text-lime-400 hover:scale-110'
        >
          {isOpen ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
        </button>
      </div>
      
      {isOpen && (
        <div className='flex-1 overflow-y-auto px-3 py-6 space-y-8'>
          {/* Starter Shelf */}
          <div>
            <div className='flex items-center gap-2 mb-4'>
              <LayoutDashboard className='w-4 h-4 text-lime-500' />
              <h2 className='text-xs font-bold text-lime-500 uppercase tracking-widest'>Starter Shelf</h2>
            </div>
            <ul className='space-y-2'>
              <li>
                <Link 
                  to="/dashboard" 
                  className='block px-3 py-2.5 text-sm text-zinc-300 hover:text-lime-400 hover:bg-lime-500/10 rounded-lg transition-all duration-200 font-medium border-l-2 border-transparent hover:border-lime-500'
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/Campaigns" 
                  className='block px-3 py-2.5 text-sm text-zinc-300 hover:text-lime-400 hover:bg-lime-500/10 rounded-lg transition-all duration-200 font-medium border-l-2 border-transparent hover:border-lime-500'
                >
                  Campaigns
                </Link>
              </li>
              <li>
                <Link 
                  to="/features" 
                  className='block px-3 py-2.5 text-sm text-zinc-300 hover:text-lime-400 hover:bg-lime-500/10 rounded-lg transition-all duration-200 font-medium border-l-2 border-transparent hover:border-lime-500'
                >
                  Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Builder Shelf */}
          <div>
            <div className='flex items-center gap-2 mb-4'>
              <Zap className='w-4 h-4 text-lime-500' />
              <h2 className='text-xs font-bold text-lime-500 uppercase tracking-widest'>Builder Shelf</h2>
            </div>
            <ul className='space-y-2'>
              <li>
                <Link 
                  to="/email-lists" 
                  className='block px-3 py-2.5 text-sm text-zinc-300 hover:text-lime-400 hover:bg-lime-500/10 rounded-lg transition-all duration-200 font-medium border-l-2 border-transparent hover:border-lime-500'
                >
                  Email Lists
                </Link>
              </li>
              <li>
                <Link 
                  to="/segments" 
                  className='block px-3 py-2.5 text-sm text-zinc-300 hover:text-lime-400 hover:bg-lime-500/10 rounded-lg transition-all duration-200 font-medium border-l-2 border-transparent hover:border-lime-500'
                >
                  Email Segments
                </Link>
              </li>
              <li>
                <Link 
                  to="/email-body-editor" 
                  className='block px-3 py-2.5 text-sm text-zinc-300 hover:text-lime-400 hover:bg-lime-500/10 rounded-lg transition-all duration-200 font-medium border-l-2 border-transparent hover:border-lime-500'
                >
                  Email Body Editor
                </Link>
              </li>
            </ul>
          </div>

          {/* Information Shelf */}
          <div>
            <div className='flex items-center gap-2 mb-4'>
              <Info className='w-4 h-4 text-lime-500' />
              <h2 className='text-xs font-bold text-lime-500 uppercase tracking-widest'>Information Shelf</h2>
            </div>
            <ul className='space-y-2'>
              <li>
                <Link 
                  to="/company-info" 
                  className='block px-3 py-2.5 text-sm text-zinc-300 hover:text-lime-400 hover:bg-lime-500/10 rounded-lg transition-all duration-200 font-medium border-l-2 border-transparent hover:border-lime-500'
                >
                  Personal Info
                </Link>
              </li>
              <li>
                <Link 
                  to="/reports" 
                  className='block px-3 py-2.5 text-sm text-zinc-300 hover:text-lime-400 hover:bg-lime-500/10 rounded-lg transition-all duration-200 font-medium border-l-2 border-transparent hover:border-lime-500'
                >
                  Reports
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}

      {!isOpen && (
        <div className='flex-1 flex items-center justify-center text-zinc-500 text-xs'>
          <div className='w-1 h-12 bg-gradient-to-b from-lime-500 via-lime-500/50 to-transparent rounded-full'></div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
