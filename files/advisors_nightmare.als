// The Advisor's Nightmare
// http://www.mit.edu/~puzzle/2017/puzzle/advisors_nightmare.html

open util/ordering[Time]
open util/ordering[Season]
open util/ordering[Year]

enum Time { pm1, pm2, pm3, pm4, pm5 }
enum Season { fall, winter, spring }
enum Year { y1, y2, y3, y4 }

enum Course {
  engm102, engm115, engm128, engm145, engm156, engm176, engm180, engm199,
  engm205, engm234, engm253, engm265, engm272, engm289,
  engm308, engm332, engm343, engm344, engm361, engm373, engm390, engm397a, engm397b,
  engm402, engm421, engm426, engm428, engm438, engm440, engm468, engm474, engm475,
  engm504, engm512, engm516, engm530
}

sig Offering {
  course: one Course,
  time: one Time,
  season: one Season,
  year: one Year,
}

sig Schedule {
  selection: set Offering
}

// Don't bother making more than one schedule since the puzzle requires a single schedule.
fact {
  #Schedule = 1
}

pred Schedule.containsAllCourses [] {
  all c : Course |
     c in this.selection.course
}

pred Schedule.threeCoursePerTrimester [] {
  all y : Year |
    all s : Season |
      #(this.selection & y.~year & s.~season) = 3
}

pred Schedule.disjointCourseTimes [] {
  all y : Year |
    all s : Season |
      all t : Time |
        lone (this.selection & y.~year & s.~season & t.~time)
}

pred Schedule.atMostOneSudokuSeminarPerTrimester [] {
  all y : Year |
    all s : Season |
      lone (this.selection & y.~year & s.~season & ( engm402.~course
                                                   + engm421.~course
                                                   + engm426.~course
                                                   + engm428.~course
                                                   + engm438.~course
                                                   + engm440.~course
                                                   + engm468.~course
                                                   + engm474.~course
                                                   + engm475.~course
                                                   ))
}

pred Schedule.atMostOneKonundrumKlassPerTrimester [] {
  all y : Year |
    all s : Season |
      lone (this.selection & y.~year & s.~season & ( engm504.~course
                                                   + engm512.~course
                                                   + engm516.~course
                                                   + engm530.~course
                                                   ))
}

pred Schedule.allCoursesOnCalendar [] {
  all o : this.selection | o.onCourseCalendar
}

pred wellFormed [s : Schedule] {
  s.containsAllCourses
  s.allCoursesOnCalendar
  s.threeCoursePerTrimester
  s.disjointCourseTimes
  s.courseCatalogConstraints
  s.atMostOneSudokuSeminarPerTrimester
  s.atMostOneKonundrumKlassPerTrimester
}

pred Offering.sameTrimester [ other : Offering ] {
  this.season = other.season && this.year = other.year
}

pred Offering.before [ other : Offering ] {
  this.year in other.year.prevs || (this.year = other.year && this.season in other.season.prevs)
}

pred Offering.immediatelyBefore [ other : Offering ] {
  (this.season = other.season.prev && this.year = other.year) ||
  (this.season = spring && other.season = fall && this.year = other.year.prev)
}

pred Offering.immediatelyAfter [ other : Offering ] {
  (this.season = other.season.next && this.year = other.year) ||
  (this.season = fall && other.season = spring && this.year = other.year.next)
}

pred Offering.consecutive [ other : Offering ] {
  this.immediatelyAfter [ other ] || this.immediatelyBefore [ other ]
}

pred Offering.immediatelyBeforeSudoku [] {
     this.immediatelyBefore [ engm402.~course ]
  || this.immediatelyBefore [ engm421.~course ]
  || this.immediatelyBefore [ engm426.~course ]
  || this.immediatelyBefore [ engm428.~course ]
  || this.immediatelyBefore [ engm438.~course ]
  || this.immediatelyBefore [ engm440.~course ]
  || this.immediatelyBefore [ engm468.~course ]
  || this.immediatelyBefore [ engm474.~course ]
  || this.immediatelyBefore [ engm475.~course ]
}

pred Offering.immediatelyAfterSudoku [] {
     this.immediatelyAfter [ engm402.~course ]
  || this.immediatelyAfter [ engm421.~course ]
  || this.immediatelyAfter [ engm426.~course ]
  || this.immediatelyAfter [ engm428.~course ]
  || this.immediatelyAfter [ engm438.~course ]
  || this.immediatelyAfter [ engm440.~course ]
  || this.immediatelyAfter [ engm468.~course ]
  || this.immediatelyAfter [ engm474.~course ]
  || this.immediatelyAfter [ engm475.~course ]
}

pred Offering.exactlyFiveTrimestersBefore [ other : Offering ] {
  // NOTE: Brute-forced because I am still learning Alloy (specifically dealing with sequences and nested orderings)
     (this.year = y1 && this.season = fall    && other.year = y2 && other.season = winter)
  || (this.year = y1 && this.season = winter  && other.year = y2 && other.season = spring)
  || (this.year = y1 && this.season = spring  && other.year = y3 && other.season = fall)
  || (this.year = y2 && this.season = fall    && other.year = y3 && other.season = winter)
  || (this.year = y2 && this.season = winter  && other.year = y3 && other.season = spring)
  || (this.year = y2 && this.season = spring  && other.year = y4 && other.season = fall)
  || (this.year = y3 && this.season = fall    && other.year = y4 && other.season = winter)
  || (this.year = y3 && this.season = winter  && other.year = y4 && other.season = spring)
}

pred Offering.atLeastNineTrimestersBefore [ other : Offering ] {
  // NOTE: Brute-forced for the same reason as 'exactlyFiveTrimestersBefore'
  (this.year = y1 && other.year = y4 && (
       (this.season = fall   && other.season in (fall + winter + spring))
    || (this.season = winter && other.season in (       winter + spring))
    || (this.season = spring && other.season in (                spring))
  ))
}

pred courseCatalogConstraints [s : Schedule] {
  // TODO: Show that these seasonal requirements are implied by the course calendar
  // Seasonal requirements
  engm102.~course.season in fall
  not engm128.~course.season in spring
  not engm145.~course.season in spring
  engm199.~course.season in fall
  not engm205.~course.season in fall
  engm253.~course.season in winter
  engm272.~course.season in fall
  engm343.~course.season in spring
  engm344.~course.season in winter
  engm397a.~course.season in fall
  engm397b.~course.season in fall
  engm440.~course.season in winter
  not engm474.~course.season in spring
  engm475.~course.season in spring
  engm504.~course.season in spring
  engm512.~course.season in spring
  engm516.~course.season in spring
  engm530.~course.season in spring

  // Same/Different trimesters
  not engm115.~course.sameTrimester [ engm265.~course ]
  engm205.~course.sameTrimester [ engm128.~course ]
  engm308.~course.sameTrimester [ engm332.~course ]
  engm390.~course.sameTrimester [ engm373.~course ]

  // Same Academic Year
  engm421.~course.year = engm426.~course.year

  // Prerequesites
  engm530.~course.before [ engm253.~course ]
  engm145.~course.before [ engm397a.~course ]
  engm397a.~course.before [ engm397b.~course ]
  engm234.~course.before [ engm180.~course ]
  engm344.~course.before [ engm199.~course ]
  engm530.~course.before [ engm253.~course ]
  engm512.~course.before [ engm272.~course ]
  engm199.~course.before [ engm343.~course ]
  engm145.~course.before [ engm344.~course ]
  engm516.~course.before [ engm397a.~course ]
  engm516.~course.before [ engm397a.~course ]
  engm402.~course.before [ engm428.~course ]

  // Consecutive
  engm115.~course.consecutive [ engm102.~course ]
  engm156.~course.consecutive [ engm512.~course ]
  engm265.~course.consecutive [ engm102.~course ]

  // Immediately after
  engm176.~course.immediatelyAfter [ engm438.~course ]

  // Between two Sudoku Seminars
  engm289.~course.immediatelyBeforeSudoku
  engm289.~course.immediatelyAfterSudoku

  // Not first trimester
  not (engm373.~course.season in fall && engm373.~course.year in y1) // TODO: Turn this in to a function

  engm438.~course.exactlyFiveTrimestersBefore [ engm468.~course ]
  engm390.~course.atLeastNineTrimestersBefore [ engm361.~course ]
}


run { Schedule.wellFormed } for 36

// Note: This is a brute force approach to modeling the time slots since the puzzle
//       provides no guidance on time slots other than a large table.
pred Offering.onCourseCalendar [] {
   (this.year = y1 && this.season = fall && (
        (this.time = pm1 && this.course in (engm102 + engm156 + engm332 + engm397a + engm397b + engm474))
    ||  (this.time = pm2 && this.course in (engm176 + engm265 + engm289 + engm361 + engm373))
    ||  (this.time = pm3 && this.course in (engm145 + engm199 + engm390 + engm402 + engm438))
    ||  (this.time = pm4 && this.course in (engm115 + engm234 + engm308 + engm426 + engm428))
    ||  (this.time = pm5 && this.course in (engm128 + engm180 + engm272 + engm421 + engm468))
    ))

  || (this.year = y1 && this.season = winter && (
        (this.time = pm1 && this.course in (engm308 + engm361 + engm402 + engm440 + engm468))
     || (this.time = pm2 && this.course in (engm128 + engm176 + engm253 + engm390 + engm474))
     || (this.time = pm3 && this.course in (engm156 + engm265 + engm344 + engm421 + engm428))
     || (this.time = pm4 && this.course in (engm205 + engm234 + engm289 + engm332 + engm438))
     || (this.time = pm5 && this.course in (engm115 + engm145 + engm180 + engm373 + engm426))
     ))

  || (this.year = y1 && this.season = spring && (
        (this.time = pm1 && this.course in (engm176 + engm421 + engm428 + engm468 + engm475))
     || (this.time = pm2 && this.course in (engm156 + engm205 + engm373 + engm390 + engm402))
     || (this.time = pm3 && this.course in (engm289 + engm308 + engm361 + engm512 + engm530))
     || (this.time = pm4 && this.course in (engm115 + engm234 + engm343 + engm426 + engm516))
     || (this.time = pm5 && this.course in (engm180 + engm265 + engm332 + engm438 + engm504))
     ))

  || (this.year = y2 && this.season = fall && (
        (this.time = pm1 && this.course in (engm115 + engm390 + engm397a + engm397b + engm426 + engm468))
     || (this.time = pm2 && this.course in (engm128 + engm156 + engm373 + engm428 + engm438))
     || (this.time = pm3 && this.course in (engm180 + engm199 + engm265 + engm361 + engm421))
     || (this.time = pm4 && this.course in (engm145 + engm234 + engm272 + engm289 + engm308))
     || (this.time = pm5 && this.course in (engm102 + engm176 + engm332 + engm402 + engm474))
     ))

  || (this.year = y2 && this.season = winter && (
        (this.time = pm1 && this.course in (engm176 + engm361 + engm421 + engm426 + engm440))
     || (this.time = pm2 && this.course in (engm180 + engm205 + engm234 + engm332 + engm344))
     || (this.time = pm3 && this.course in (engm128 + engm156 + engm373 + engm390 + engm438))
     || (this.time = pm4 && this.course in (engm115 + engm145 + engm289 + engm402 + engm474))
     || (this.time = pm5 && this.course in (engm253 + engm265 + engm308 + engm428 + engm468))
     ))

  || (this.year = y2 && this.season = spring && (
        (this.time = pm1 && this.course in (engm176 + engm361 + engm468 + engm512 + engm516))
     || (this.time = pm2 && this.course in (engm234 + engm265 + engm343 + engm438 + engm475))
     || (this.time = pm3 && this.course in (engm156 + engm205 + engm332 + engm421 + engm504))
     || (this.time = pm4 && this.course in (engm180 + engm308 + engm402 + engm426 + engm530))
     || (this.time = pm5 && this.course in (engm115 + engm289 + engm373 + engm390 + engm428))
     ))

  || (this.year = y3 && this.season = fall && (
        (this.time = pm1 && this.course in (engm145 + engm199 + engm332 + engm390 + engm397a + engm397b))
     || (this.time = pm2 && this.course in (engm115 + engm265 + engm373 + engm426 + engm438))
     || (this.time = pm3 && this.course in (engm102 + engm128 + engm272 + engm421 + engm468))
     || (this.time = pm4 && this.course in (engm176 + engm180 + engm289 + engm308 + engm474))
     || (this.time = pm5 && this.course in (engm156 + engm234 + engm361 + engm402 + engm428))
     ))

  || (this.year = y3 && this.season = winter && (
        (this.time = pm1 && this.course in (engm145 + engm156 + engm176 + engm361 + engm426))
     || (this.time = pm2 && this.course in (engm205 + engm253 + engm265 + engm440 + engm468))
     || (this.time = pm3 && this.course in (engm115 + engm289 + engm373 + engm428 + engm438))
     || (this.time = pm4 && this.course in (engm128 + engm332 + engm344 + engm421 + engm474))
     || (this.time = pm5 && this.course in (engm180 + engm234 + engm308 + engm390 + engm402))
     ))

  || (this.year = y3 && this.season = spring && (
        (this.time = pm1 && this.course in (engm289 + engm308 + engm332 + engm343 + engm428))
     || (this.time = pm2 && this.course in (engm176 + engm361 + engm421 + engm426 + engm468))
     || (this.time = pm3 && this.course in (engm115 + engm205 + engm402 + engm438 + engm504))
     || (this.time = pm4 && this.course in (engm156 + engm180 + engm475 + engm512 + engm516))
     || (this.time = pm5 && this.course in (engm234 + engm265 + engm373 + engm390 + engm530))
     ))

  || (this.year = y4 && this.season = fall && (
        (this.time = pm1 && this.course in (engm115 + engm289 + engm426 + engm438 + engm474))
     || (this.time = pm2 && this.course in (engm145 + engm156 + engm176 + engm421 + engm468))
     || (this.time = pm3 && this.course in (engm102 + engm128 + engm265 + engm332 + engm390))
     || (this.time = pm4 && this.course in (engm234 + engm308 + engm361 + engm397a + engm397b + engm428))
     || (this.time = pm5 && this.course in (engm180 + engm199 + engm272 + engm373 + engm402))
     ))

  || (this.year = y4 && this.season = winter && (
        (this.time = pm1 && this.course in (engm176 + engm332 + engm344 + engm361 + engm474))
     || (this.time = pm2 && this.course in (engm205 + engm253 + engm289 + engm373 + engm421))
     || (this.time = pm3 && this.course in (engm115 + engm156 + engm180 + engm428 + engm468))
     || (this.time = pm4 && this.course in (engm145 + engm234 + engm426 + engm438 + engm440))
     || (this.time = pm5 && this.course in (engm128 + engm265 + engm308 + engm390 + engm402))
     ))

  || (this.year = y4 && this.season = spring && (
        (this.time = pm1 && this.course in (engm308 + engm361 + engm390 + engm475 + engm504))
     || (this.time = pm2 && this.course in (engm180 + engm205 + engm234 + engm265 + engm530))
     || (this.time = pm3 && this.course in (engm176 + engm289 + engm343 + engm421 + engm438))
     || (this.time = pm4 && this.course in (engm332 + engm426 + engm428 + engm468 + engm516))
     || (this.time = pm5 && this.course in (engm115 + engm156 + engm373 + engm402 + engm512))
     ))
}
