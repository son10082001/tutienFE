import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface NavItem {
  id: number;
  label: string;
  url: string;
  icon?: LucideIcon;
  dropdown?: boolean;
  items?: {
    title: string;
    links: {
      label: string;
      url: string;
      description?: string;
      icon?: LucideIcon;
    }[];
  }[];
}

interface DropdownNavigationProps {
  items: NavItem[];
  className?: string;
}

export function DropdownNavigation({ items, className }: DropdownNavigationProps) {
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = React.useState<number | null>(null);

  const handleHover = (menuLabel: string | null) => {
    setOpenMenu(menuLabel);
  };

  return (
    <nav className={cn('relative z-50 font-montserrat', className)}>
      <motion.div
        className='flex items-center gap-1 py-2 px-2 rounded-lg'
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
      >
        <ul className='flex items-center'>
          {items.map((item) => (
            <li
              key={item.id}
              className='relative'
              onMouseEnter={() => handleHover(item.label)}
              onMouseLeave={() => handleHover(null)}
            >
              <Link
                href={item.url}
                className={cn(
                  'text-base font-[600] py-2 px-4 flex items-center justify-center gap-1 text-neutral-100 hover:text-neutral-100 transition-colors duration-300 rounded-md relative'
                )}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {item.icon && <item.icon className='h-4 w-4 mr-1' />}
                <span className='font-montserrat'>{item.label}</span>
                {item.items && (
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 transition-transform duration-300',
                      openMenu === item.label ? 'rotate-180' : ''
                    )}
                  />
                )}

                {(hoveredItem === item.id || openMenu === item.label) && (
                  <motion.div
                    layoutId='hover-bg'
                    className='absolute inset-0 bg-[#0C111DCC] rounded-md -z-10'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>

              <AnimatePresence>
                {openMenu === item.label && item.items && (
                  <div className='absolute left-0 top-full pt-2'>
                    <motion.div
                      className='bg-[#0C111DCC] rounded-md shadow-lg w-max'
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    >
                      <div className='flex gap-8'>
                        {item.items.map((section) => (
                          <div key={section.title} className='min-w-[200px]'>
                            <ul className='space-y-3'>
                              {section.links.map((link) => {
                                const Icon = link.icon;
                                return (
                                  <motion.li
                                    key={link.label}
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                  >
                                    <Link
                                      href={link.url}
                                      className='flex items-start gap-3 group hover:bg-accent/50 py-3 px-6 rounded-md transition-all duration-200 hover:shadow-sm'
                                    >
                                      {Icon && (
                                        <motion.div
                                          className='text-neutral-100 rounded-md flex items-center justify-center h-8 w-8 shrink-0 group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300'
                                          whileHover={{ rotate: 5 }}
                                          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                        >
                                          <Icon className='h-4 w-4' />
                                        </motion.div>
                                      )}
                                      <div>
                                        <p className='text-md font-semibold leading-5 text-neutral-100 group-hover:translate-x-1 transition-transform duration-200 font-montserrat'>
                                          {link.label}
                                        </p>
                                        {link.description && (
                                          <p className='text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 group-hover:translate-x-0.5'>
                                            {link.description}
                                          </p>
                                        )}
                                      </div>
                                    </Link>
                                  </motion.li>
                                );
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>
      </motion.div>
    </nav>
  );
}
