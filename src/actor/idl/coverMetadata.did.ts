// @ts-nocheck
export const idlFactory = ({ IDL }) => {
  const CoverMetadata = IDL.Record({
    'controller' : IDL.Text,
    'dfx_version' : IDL.Text,
    'canister_name' : IDL.Text,
    'commit_hash' : IDL.Text,
    'repo_url' : IDL.Text,
    'rust_version' : IDL.Opt(IDL.Text),
    'optimize_count' : IDL.Nat8,
  });
  return IDL.Service({
    'coverMetadata' : IDL.Func([], [CoverMetadata], ['query']),
  });
};
