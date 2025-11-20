"use client";

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the client-side BooksTabs to avoid SSR issues
const BooksTabs = dynamic(() => import('@/components/books-tabs'), { ssr: false });

export default function BooksTabsWrapper(props: any) {
  return <BooksTabs {...props} />;
}
