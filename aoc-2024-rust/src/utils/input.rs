use anyhow::Result;
use std::fs;

pub fn read_input(day: u8) -> Result<String> {
    Ok(fs::read_to_string(format!("inputs/day{:02}.txt", day))?)
}
