"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Bell, AlertTriangle, AlertCircle, Info, Check, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NotificationCenter() {
  const { notifications, unreadCount, markNotificationRead, clearAllNotifications } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "Critical":
        return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", iconColor: "text-red-600" };
      case "High":
        return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", iconColor: "text-amber-600" };
      case "Medium":
        return { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", iconColor: "text-yellow-600" };
      case "Low":
        return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", iconColor: "text-blue-600" };
      default:
        return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", iconColor: "text-gray-600" };
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "Failure":
      case "Incident":
        return AlertCircle;
      case "Compliance":
      case "Audit":
        return AlertTriangle;
      default:
        return Info;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-all-custom focus:outline-none"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white leading-none">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-96 bg-white border border-gray-200 rounded-sharp shadow-panel z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <span className="font-semibold text-xs text-gray-900 uppercase tracking-wider">Alert & Notification Center</span>
            {notifications.length > 0 && (
              <button
                onClick={() => clearAllNotifications()}
                className="text-[11px] font-medium text-gray-500 hover:text-gray-900 transition-all-custom"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">
                No active notifications or alerts.
              </div>
            ) : (
              notifications.map((notif) => {
                const styles = getSeverityStyles(notif.severity);
                const Icon = getIcon(notif.type);
                return (
                  <div
                    key={notif.id}
                    className={`p-4 transition-all-custom ${notif.isRead ? "bg-white" : styles.bg} flex flex-col gap-1`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex gap-2">
                        <Icon className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${styles.iconColor}`} />
                        <div className="flex flex-col gap-0.5">
                          <span className={`text-xs font-semibold ${notif.isRead ? "text-gray-900" : styles.text}`}>
                            {notif.message}
                          </span>
                          <span className="text-[11px] text-gray-500 leading-normal">
                            {notif.details}
                          </span>
                        </div>
                      </div>
                      
                      {/* Mark Read Check */}
                      {!notif.isRead && (
                        <button
                          onClick={() => markNotificationRead(notif.id)}
                          title="Mark as read"
                          className="text-gray-400 hover:text-gray-900 p-0.5 rounded shrink-0"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Metadata & Actions */}
                    <div className="mt-2.5 flex items-center justify-between pl-6.5 text-[10px] text-gray-400">
                      <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {notif.actionUrl && (
                        <Link
                          href={notif.actionUrl}
                          onClick={() => {
                            setIsOpen(false);
                            markNotificationRead(notif.id);
                          }}
                          className="flex items-center gap-1 font-semibold text-[#2563EB] hover:underline"
                        >
                          <span>{notif.actionLabel || "Resolve"}</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
