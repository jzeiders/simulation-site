use anyhow::{Context, Result};
use std::env;
use std::fs;
use advent_of_code_2024::days::day09;

fn main() -> Result<()> {
    let args: Vec<String> = env::args().collect();
    if args.len() != 3 {
        println!("Usage: {} <day> <part>", args[0]);
        println!("Example: {} 9 1", args[0]);
        return Ok(());
    }

    let day: u8 = args[1].parse().context("Day must be a number")?;
    let part: u8 = args[2].parse().context("Part must be a number")?;
    
    println!("Day: {}", day);
    println!("Part: {}", part);
    println!("{}", format!("inputs/day{:02}.txt", day));
    let input = fs::read_to_string(format!("inputs/day{:02}.txt", day))
        .context("Could not read input file")?;

    let result = match (day, part) {
        (9, 1) => day09::part1(&input)?,
        (9, 2) => day09::part2(&input)?,
        _ => anyhow::bail!("Day {} part {} not implemented", day, part),
    };

    println!("Result: {}", result);
    Ok(())
}