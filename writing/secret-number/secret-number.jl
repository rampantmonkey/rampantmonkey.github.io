function Addition(a::Int, b::Int)::Tuple{Int, Int}
    if a+b >= 180
        (180, 199)
    elseif a+b <= 20
        (3, 20)
    else
        (a+b, a+b)
    end
end

Multiplication(a::Int, b::Int)::Int = (a*b)%10
Division(a::Int, b::Int)::Int = max(a, b) ÷ min(a, b)
Zero(a::Int, b::Int)::Int = abs((max(a, b)-1)÷10 - (min(a,b)-1)÷10)

# Build the whole table for the 2d range of numbers
addition_table       = [Addition(x, y) for x ∈ 1:100, y ∈ 1:100]
multiplication_table = [Multiplication(x, y) for x ∈ 1:100, y ∈ 1:100]
division_table       = [Division(x, y) for x ∈ 1:100, y ∈ 1:100]
zero_table           = [Zero(x, y) for x ∈ 1:100, y ∈ 1:100]

# For every possible pair of players, how many options are removed by playing each of the tickets?
