import { NavLink } from 'react-router-dom'

const AdminSidebar = () => {
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Orders', href: '/admin/orders', icon: '📦' },
    { name: 'Books', href: '/admin/books', icon: '📚' },
    { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
  ]

  return (
    <div className="w-64 bg-kenyan-green text-white h-screen fixed left-0 top-0 pt-16">
      <nav className="mt-8">
        <ul className="space-y-1 px-4">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white text-kenyan-green'
                      : 'text-kenyan-yellow hover:bg-green-700 hover:text-white'
                  }`
                }
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default AdminSidebar