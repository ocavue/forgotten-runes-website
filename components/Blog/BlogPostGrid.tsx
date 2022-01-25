import styled from "@emotion/styled";

export const BlogPostGrid = styled.div`
  display: grid;
  grid-auto-columns: 1fr;
  grid-column-gap: 3.5rem;
  grid-row-gap: 3.5rem;
  grid-template-rows: auto;

  grid-template-columns: 1fr;
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (min-width: 960px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`;
