import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { motion } from 'framer-motion'
import { Popover } from '@headlessui/react'
import CartList from './CartList'
import Button from '../ui/Button'
import { formatCurrency } from '../../utils/formatCurrency'

const MiniCart = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { items, getCartCount, getCartTotal } = useCart()
  const itemCount = getCartCount()

  return (
    <Popover className="relative">
      <Popover.Button 
        className="relative p-2 text-gray-600 hover:text-kenyan-green focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        
        {itemCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-kenyan-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
          >
            {itemCount}
          </motion.span>
        )}
      </Popover.Button>

      <Popover.Panel className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
        {({ close }) => (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Your Cart</h3>
            
            {items.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Your cart is empty</p>
            ) : (
              <>
                <div className="max-h-64 overflow-y-auto">
                  <CartList items={items} variant="mini" />
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-kenyan-green">
                      {formatCurrency(getCartTotal())}
                    </span>
                  </div>
                  
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      close()
                    }}
                  >
                    <Link to="/cart" className="w-full block">
                      View Cart
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Popover.Panel>
    </Popover>
  )
}

export default MiniCart