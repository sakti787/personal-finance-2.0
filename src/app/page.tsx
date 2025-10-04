'use client';

import { ClipboardList, GanttChartSquare, Target } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen aurora-background text-foreground">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 px-8 py-24">
        {/* Text Content */}
        <motion.div 
          className="space-y-6 text-center md:text-left"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.2, // Stagger children animations
              },
            },
          }}
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6 }}
          >
            Kelola Keuangan Jadi Simpel & Cerdas.
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6 }}
          >
            UangSakti adalah platform intuitif untuk anak muda Indonesia. Lacak pengeluaran, atur budget, dan capai semua tujuan finansial Anda dengan mudah.
          </motion.p>
          <motion.div 
            className="flex justify-center md:justify-start gap-4"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/auth/signup">
              <motion.button 
                className="px-6 py-3 font-semibold rounded-lg bg-gradient-to-r from-accent-start to-accent-end text-primary-foreground"
                whileHover={{ scale: 1.05 }} // Scale up on hover
                whileTap={{ scale: 0.95 }} // Scale down on tap
              >
                Get Started
              </motion.button>
            </Link>
            <Link href="/auth/login">
              <motion.button 
                className="px-6 py-3 font-semibold rounded-lg bg-card-glass border border-border"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
        {/* Image Mockup */}
        <motion.div
          animate={{ y: [0, -12, 0] }} // Floating effect
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/path-to-your-dashboard-mockup.png"
            alt="UangSakti Dashboard Mockup"
            width={1200}
            height={780}
            className="rounded-lg shadow-2xl"
          />
        </motion.div>
      </section>

      {/* Features Section */}
      <motion.section 
        className="max-w-7xl mx-auto px-8 py-24"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }} // Fade in when in view
        viewport={{ once: true }} // Trigger only once
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl font-bold text-center mb-12">Fitur Unggulan</h2>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.3, // Stagger card animations
              },
            },
          }}
        >
          {/* Feature Card 1 */}
          <motion.div 
            className="card-glass p-6 rounded-xl"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ scale: 1.05, y: -8 }} // Scale and lift on hover
            transition={{ duration: 0.3 }}
          >
            <ClipboardList className="w-8 h-8 mb-4 text-accent-start" />
            <h3 className="text-xl font-bold mb-2">Track Expenses</h3>
            <p className="text-muted-foreground">Monitor your spending habits across different categories.</p>
          </motion.div>
          {/* Feature Card 2 */}
          <motion.div 
            className="card-glass p-6 rounded-xl"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ scale: 1.05, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <GanttChartSquare className="w-8 h-8 mb-4 text-accent-start" />
            <h3 className="text-xl font-bold mb-2">Set Budgets</h3>
            <p className="text-muted-foreground">Create monthly budgets and stay within your limits.</p>
          </motion.div>
          {/* Feature Card 3 */}
          <motion.div 
            className="card-glass p-6 rounded-xl"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ scale: 1.05, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <Target className="w-8 h-8 mb-4 text-accent-start" />
            <h3 className="text-xl font-bold mb-2">Achieve Goals</h3>
            <p className="text-muted-foreground">Track your progress toward your financial goals.</p>
          </motion.div>
        </motion.div>
      </motion.section>
    </div>
  );
}