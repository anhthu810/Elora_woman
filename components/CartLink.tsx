'use client';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
export default function CartLink() {
  const { count } = useCart();
  return <Link href="/gio-hang">Giỏ hàng ({count})</Link>;
}
