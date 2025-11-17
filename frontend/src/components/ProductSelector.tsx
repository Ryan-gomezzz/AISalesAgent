import React from 'react'
import './ProductSelector.css'

export type ProductOption = 
  | 'accountancy'
  | 'soil'
  | 'ai-receptionist'
  | null

interface ProductSelectorProps {
  selectedProduct: ProductOption
  onSelectProduct: (product: ProductOption) => void
  disabled?: boolean
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  selectedProduct,
  onSelectProduct,
  disabled = false,
}) => {
  const products = [
    {
      id: 'accountancy' as ProductOption,
      title: 'Chartered Accountancy Services',
      description: 'Register your startup and get expert financial guidance',
      icon: '📊',
    },
    {
      id: 'soil' as ProductOption,
      title: 'SOIL - Business Scaling Platform',
      description: 'AI-powered platform to scale and grow your business',
      icon: '🚀',
    },
    {
      id: 'ai-receptionist' as ProductOption,
      title: 'AI Receptionist',
      description: '24/7 automated customer service and support',
      icon: '🤖',
    },
  ]

  return (
    <div className="product-selector" role="group" aria-label="Select a product or service">
      <h3 className="product-selector-title">What can I help you with today?</h3>
      <div className="product-grid">
        {products.map((product) => (
          <button
            key={product.id}
            className={`product-card ${selectedProduct === product.id ? 'selected' : ''}`}
            onClick={() => !disabled && onSelectProduct(product.id === selectedProduct ? null : product.id)}
            disabled={disabled}
            aria-pressed={selectedProduct === product.id}
            aria-label={`Select ${product.title}`}
          >
            <div className="product-icon">{product.icon}</div>
            <div className="product-content">
              <h4 className="product-title">{product.title}</h4>
              <p className="product-description">{product.description}</p>
            </div>
            {selectedProduct === product.id && (
              <div className="product-checkmark">✓</div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ProductSelector

