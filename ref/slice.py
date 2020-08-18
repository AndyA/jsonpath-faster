#!/usr/bin/env python

a = ["a", "b", "c", "d", "e", "f", "g", "h", "i"]

print a               # ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
print a[1:]           # ['b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
print a[-3:]          # ['g', 'h', 'i']
print a[:]            # ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
print a[::]           # ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
print a[::3]          # ['a', 'd', 'g']
print a[2::-1]        # ['c', 'b', 'a']
print a[2:0:-1]       # ['c', 'b']
print a[-1:-4:-2]     # ['i', 'g']
print a[::-1]         # ['i', 'h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']

# Out of range

print a[-1000:1000]
print a[1000:-1000:-1]

# vim:ts=2:sw=2:sts=2:et:ft=python

