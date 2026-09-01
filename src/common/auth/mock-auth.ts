"use client";

import { useSyncExternalStore } from "react";

export type MockUserRole = "admin" | "counselor";

export type MockUser = {
  id: string;
  email: string;
  password: string;
  username: string;
  initials: string;
  role: MockUserRole;
  destination: "/" | "/admin";
};

export const mockUsers: MockUser[] = [
  {
    id: "USR-CON-001",
    email: "may.zin@meetta.com",
    password: "password123",
    username: "May Zin",
    initials: "MZ",
    role: "counselor",
    destination: "/",
  },
  {
    id: "admin-aye-chan",
    email: "admin@meetta.com",
    password: "admin123",
    username: "Aye Darli",
    initials: "AD",
    role: "admin",
    destination: "/admin",
  },
];

const STORAGE_KEY = "meetta-mock-user-id";
const AUTH_EVENT = "meetta-mock-auth-change";
const defaultUser =
  mockUsers.find((user) => user.role === "counselor") ?? mockUsers[0];

export function findMockUser(email: string, password: string) {
  return mockUsers.find(
    (user) =>
      user.email === email.trim().toLowerCase() && user.password === password,
  );
}

export function setActiveMockUser(user: MockUser) {
  window.localStorage.setItem(STORAGE_KEY, user.id);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearActiveMockUser() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function useMockUser() {
  return useSyncExternalStore(subscribe, getClientUser, () => defaultUser);
}

function getClientUser() {
  const userId = window.localStorage.getItem(STORAGE_KEY);
  return mockUsers.find((user) => user.id === userId) ?? defaultUser;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(AUTH_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(AUTH_EVENT, onStoreChange);
  };
}
