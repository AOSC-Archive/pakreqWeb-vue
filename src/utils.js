export function jaroWinkler (a, b) {
  var m = 0 // Number of matches
  var t = 0 // Number of transpositions
  var p = 0.1 // Winkler score scaling factor
  var l = 0 // Common prefix length
  var miss = false
  for (var i = 0; i < a.length; i++) {
    m += b.includes(a[i])
    t += (a[i] !== b[i])
    if (a[i] === b[i] && miss) l++; else miss = true
  }
  t /= 2 // Number of transpositions / 2
  var jaro = m === 0 ? 0 : (m / a.length + m / b.length + (m - t) / m) / 3 // Jaro distance
  return jaro + (p * l) * (1 - jaro) // Jaro-Winkler distance
}

// Copied from https://github.com/aceakash/string-similarity/blob/f83ba3cd7bae874c20c429774e911ae8cff8bced/src/index.js#L6
// MIT License
export function sorensenDice (first, second) {
  first = first.replace(/\s+/g, '')
  second = second.replace(/\s+/g, '')

  if (!first.length && !second.length) return 1 // if both are empty strings
  if (!first.length || !second.length) return 0 // if only one is empty string
  if (first === second) return 1 // identical
  if (first.length === 1 && second.length === 1) return 0 // both are 1-letter strings
  if (first.length < 2 || second.length < 2) return 0 // if either is a 1-letter string

  const firstBigrams = new Map()
  for (let i = 0; i < first.length - 1; i++) {
    const bigram = first.substring(i, i + 2)
    const count = firstBigrams.has(bigram)
      ? firstBigrams.get(bigram) + 1
      : 1

    firstBigrams.set(bigram, count)
  };

  let intersectionSize = 0
  for (let i = 0; i < second.length - 1; i++) {
    const bigram = second.substring(i, i + 2)
    const count = firstBigrams.has(bigram)
      ? firstBigrams.get(bigram)
      : 0

    if (count > 0) {
      firstBigrams.set(bigram, count - 1)
      intersectionSize++
    }
  }

  return (2.0 * intersectionSize) / (first.length + second.length - 2)
}

export function repologyFilter (name, input, similarName) {
  var resultStable = null
  var resultUnstable = null
  var possibleSummaries = []
  var possibleCategories = []
  var possibleDownloads = []
  for (var i = 0; i < input.length; i++) {
    var repo = input[i]
    if (repo.summary && !possibleSummaries.includes(repo.summary)) possibleSummaries.push(repo.summary)
    if (repo.categories && !possibleCategories.includes(repo.categories)) possibleCategories.push(repo.categories)
    if (repo.downloads && !possibleDownloads.includes(repo.downloads)) possibleDownloads.push(repo.downloads)
    if (repo.status === 'newest') {
      resultStable = {
        name: name,
        version: repo.version,
        www: repo.www,
        unstable: false
      }
    } else if (repo.status === 'rolling' || repo.status === 'unique') {
      resultStable = {
        name: name,
        version: repo.version,
        www: repo.www,
        unstable: true
      }
    }
  }
  var finalResult = resultStable || resultUnstable
  if (finalResult) {
    finalResult.summaries = possibleSummaries
    finalResult.categories = possibleCategories
    finalResult.downloads = possibleDownloads
    if (similarName) finalResult.similarity = sorensenDice(name, similarName)
  }
  return finalResult
}

export function normalizeName (name) {
  var replaced = name.trim().toLowerCase().replace(/[^0-9a-z+\-.]/g, '')
  var pattern = /[0-9a-z][0-9a-z+\-.]+/
  var matched = pattern.exec(replaced)
  return matched ? matched[0] : null
}

export function getSettings () {
  if (!('localStorage' in window)) return null
  try {
    var settings = JSON.parse(window.localStorage.getItem('settings'))
    return settings
  } catch (e) {
    return null
  }
}
