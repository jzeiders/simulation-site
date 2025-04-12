use anyhow::Result;


use std::collections::{BTreeMap, HashSet};

#[derive(Debug, Clone)]
struct Block {
    id: Option<String>,
    length: u32,
}

#[derive(Debug)]
struct BlockManager {
    blocks: BTreeMap<u32, Block>,
}

#[derive(Debug)]
struct DiskState {
    blocks: Vec<Block>,
}

impl DiskState {
    fn new(input: &str) -> Self {
        let mut blocks = Vec::new();
        for (pos, block) in input.chars().enumerate() {
            if pos % 2 == 0 {
                blocks.push(Block {
                    id: Some((pos / 2).to_string()),
                    length: block.to_digit(10).unwrap(),
                });
            } else {
                blocks.push(Block {
                    id: None,
                    length: block.to_digit(10).unwrap(),
                });
            }
        }
        Self { blocks }
    }
    fn get_continuous_blocks(&self) -> Vec<Block> {
        let mut result = Vec::new();
        for block in self.blocks {
            if block.id.is_some() {
                result.push(block);
            }
        }
        result
    }
    fn score(&self) -> u32 {
        let mut result = 0;
        let block_iter = self.get_continuous_blocks().rev();
        for (_, block) in used_blocks {
            if block.id.is_some() {
                result += block.length * block.id.unwrap().parse::<u32>().unwrap();
            } else {
                let mut target_size = block.length;
                while target_size > 0 {
                    let next_block = block_iter.next();
                    if next_block.size() > target_size {
                        result += next_block.size() - target_size;
                        target_size = 0;
                    } else {
                        target_size -= next_block.size();

                    }
                    block_iter.next();
                }
            }
        }
        result
    }

}




pub fn part1(input: &str) -> Result<u32> {
    let mut manager = DiskState::new(input);
  
}
    let mut result = 0;
    println!("{}", manager.format_blocks());
    for (_, block) in manager.blocks {
        if block.id.is_some() {
            result += block.length * block.id.unwrap().parse::<u32>().unwrap();
        }
    }
    println!("{}", result);
    Ok(result)
}

pub fn part2(input: &str) -> Result<u32> {
    Ok(0)
}

#[cfg(test)]
mod tests {
    use super::*;

    const TEST_INPUT: &str = "2333133121414131402";
    #[test]
    fn test_part1() -> Result<()> {
        assert_eq!(part1(TEST_INPUT)?, 1928);
        Ok(())
    }

}