module PokemonExperience

using Plots

@enum Group begin
    Fluctuating
    Slow
    MediumSlow
    MediumFast
    Fast
    Erratic
end

exp(l::Int, g::Group) = exp(l, Val(g))

macro exp(group, eq)
    eval(quote
             exp(l::Int, ::Val{$group})::Int = max(0, floor($eq))
         end)
end

@exp(Fast, 4l^3/5)
@exp(MediumFast, l^3)
@exp(MediumSlow, 6l^3/5 - 15l^2 + 100l - 140)
@exp(Slow, 5l^3/4)
@exp(Fluctuating, begin
         if l < 15
             l^3*(floor((l+1)/3) + 24)/50
         elseif l < 36
             l^3*(l+14)/50
         else
             l^3*(floor(l/2)+32)/50
         end
     end)
@exp(Erratic, begin
         if l < 50
             l^3*(100-l)/50
         elseif l < 68
             l^3*(150-l)/100
         elseif l < 98
             l^3*floor((1911-10l)/3)/500
         else
             l^3*(160-l)/100
         end
     end)

# Colors to match my website
const darksienna = RGB(0x23/0xff, 0x0c/0xff, 0x0f/0xff)
const antiquewhitelight = RGB(0xfd/0xff, 0xf9/0xff, 0xf3/0xff)
const brass = RGB(0xb5/0xff, 0xa6/0xff, 0x42/0xff)
const cafenoir = RGB(0x4e/0xff, 0x38/0xff, 0x22/0xff)
const flame = RGB(0xd4/0xff, 0x51/0xff, 0x13/0xff)
const polishedpine = RGB(0x4e/0xff, 0xa6/0xff, 0x99/0xff)
const englishviolet = RGB(0x51/0xff, 0x35/0xff, 0x5a/0xff)
const puce = RGB(0xd4/0xff, 0x96/0xff, 0xa7/0xff)

const seriescolors = [brass,
                      englishviolet,
                      puce,
                      cafenoir,
                      flame,
                      polishedpine]

function plotcumulative()
    p = plot(; xlims=(0, 100),
               fontfamily="monospace",
               title="Minimum Experience to Reach Level",
               xlabel="Level",
               ylabel="Experience Points",
               formatter=:plain,
               legend_foreground_color=nothing,
               size=(1080, 540))

    for (i, g) in Group |> instances |> enumerate
        plot!(p,
              [exp(l, g) for l ∈ 1:100];
              color=seriescolors[i],
              label="$g")
    end

    p
end

function plotdelta()
    p = plot(; xlims=(0, 100),
               fontfamily="monospace",
               title="Experience to Next Level",
               xlabel="level",
               ylabel="Experience Points",
               formatter=:plain,
               legend_foreground_color=nothing,
               size=(1080, 540))
    for (i, g) in Group |> instances |> enumerate
        plot!(p,
              [exp(l, g) - exp(l-1, g) for l ∈ 1:100];
              color=seriescolors[i],
              label="$g")
    end
    p
end

function plotall()
    savefig(plot(plotcumulative(),
                 plotdelta();
                 layout=(2,1),
                 fontfamily="monospace",
                 bgcolor=antiquewhitelight,
                 fgcolor=darksienna,
                 size=(1080,1080)),
            "exp.png")
    nothing
end

end # module PokemonExperience
