'use client';

// PolicySimulator - try a transfer against the agent's spending rules.
// Mirrors lib/agent-policy.ts; it only explains the rules, it never moves funds.

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ShieldCheck, ShieldX } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PolicyValues {
  maxPerTxUsdc: number;
  dailyCapUsdc: number;
  minTrustScore: number;
}

// Module-level so dragging a slider does not remount it on every render.
function Slider({
  label,
  value,
  onChange,
  max,
  unit,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  max: number;
  unit: string;
}) {
  return (
    <label className="block">
      <span className="flex justify-between text-xs text-slate-400">
        {label}
        <span className="font-medium text-white">
          {value} {unit}
        </span>
      </span>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-cyan-400"
      />
    </label>
  );
}

export function PolicySimulator({ policy }: { policy: PolicyValues }) {
  const [amount, setAmount] = useState(3);
  const [trust, setTrust] = useState(82);
  const [spent, setSpent] = useState(0);

  const rules = [
    {
      name: 'Per-transfer cap',
      ok: amount > 0 && amount <= policy.maxPerTxUsdc,
      text: `${amount} USDC ≤ ${policy.maxPerTxUsdc} USDC per transfer`,
    },
    {
      name: '24-hour budget',
      ok: spent + amount <= policy.dailyCapUsdc,
      text: `${spent} already spent + ${amount} = ${spent + amount} ≤ ${policy.dailyCapUsdc} USDC per 24h`,
    },
    {
      name: 'Minimum trust score',
      ok: trust >= policy.minTrustScore,
      text: `score ${trust} ≥ ${policy.minTrustScore}`,
    },
  ];
  const allowed = rules.every((r) => r.ok);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Slider label="Transfer amount" value={amount} onChange={setAmount} max={Math.max(policy.maxPerTxUsdc * 2, 10)} unit="USDC" />
        <Slider label="Project trust score" value={trust} onChange={setTrust} max={100} unit="/ 100" />
        <Slider label="Already spent in the last 24h" value={spent} onChange={setSpent} max={policy.dailyCapUsdc} unit="USDC" />
        <p className="text-xs text-slate-500">
          This is a calculator for understanding the rules. It does not send anything.
        </p>
      </div>

      <div className="space-y-2">
        {rules.map((r, i) => (
          <motion.div
            key={r.name}
            layout
            initial={false}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              'flex items-start gap-2 rounded-lg border p-3 text-sm',
              r.ok ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'
            )}
          >
            {r.ok ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
            )}
            <div>
              <p className="font-medium text-white">{r.name}</p>
              <p className="text-xs text-slate-400">{r.text}</p>
            </div>
          </motion.div>
        ))}

        <motion.div
          key={String(allowed)}
          initial={{ scale: 0.97, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            'flex items-center gap-3 rounded-xl border p-4',
            allowed ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-red-500/40 bg-red-500/10'
          )}
        >
          {allowed ? <ShieldCheck className="h-6 w-6 text-emerald-400" /> : <ShieldX className="h-6 w-6 text-red-400" />}
          <div>
            <p className={cn('font-semibold', allowed ? 'text-emerald-300' : 'text-red-300')}>
              {allowed ? 'Transfer allowed' : 'Transfer refused'}
            </p>
            <p className="text-xs text-slate-400">
              {allowed
                ? 'All three rules pass, so the agent sends the USDC.'
                : 'At least one rule fails. Nobody — not even the owner — can override it from the app.'}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
