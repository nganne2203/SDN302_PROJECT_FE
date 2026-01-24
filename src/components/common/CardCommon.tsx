import { Card as AntCard } from 'antd'
import type { CardProps as AntCardProps } from 'antd'
import type { ReactNode, CSSProperties } from 'react'

export interface CardCommonProps {
  title?: ReactNode
  subtitle?: string
  extra?: ReactNode
  children?: ReactNode
  loading?: boolean
  bordered?: boolean
  hoverable?: boolean
  size?: 'small' | 'default'
  className?: string
  style?: CSSProperties
  bodyStyle?: CSSProperties
  headStyle?: CSSProperties
  cover?: ReactNode
  actions?: ReactNode[]
  onClick?: () => void
  type?: 'inner' | 'default'
}

const CardCommon = ({
  title,
  subtitle,
  extra,
  children,
  loading = false,
  bordered = true,
  hoverable = false,
  size = 'default',
  className = '',
  style,
  bodyStyle,
  headStyle,
  cover,
  actions,
  onClick,
  type,
}: CardCommonProps) => {
  const cardTitle = subtitle ? (
    <div>
      <div style={{ fontSize: size === 'small' ? 14 : 16, fontWeight: 600 }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ 
          fontSize: 12, 
          fontWeight: 400, 
          color: '#8c8c8c',
          marginTop: 4 
        }}>
          {subtitle}
        </div>
      )}
    </div>
  ) : title

  const antCardProps: AntCardProps = {
    title: cardTitle,
    extra,
    loading,
    bordered,
    hoverable,
    size,
    className: `card-common ${className}`,
    style: {
      ...(onClick && { cursor: 'pointer' }),
      ...style,
    },
    bodyStyle,
    headStyle,
    cover,
    actions,
    onClick,
    ...(type === 'inner' && { type }),
  }

  return <AntCard {...antCardProps}>{children}</AntCard>
}

export default CardCommon
