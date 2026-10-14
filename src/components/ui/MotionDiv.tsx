'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export function MotionDiv({ children, className, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
